import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  STEAM_CONNECTED_STORAGE_KEY,
  STEAM_TOAST_MS
} from '../constants/checklist.constants';
import { ChecklistStore } from './checklist.store';

export type SteamAuthStatus = 'idle' | 'loading' | 'connected' | 'error';

export type SteamSyncErrorCode =
  | 'not_connected'
  | 'private_profile'
  | 'steam_unavailable'
  | 'missing_api_key'
  | 'unknown';

export type SteamToastKind = 'success' | 'error';

export interface SteamToast {
  kind: SteamToastKind;
  message: string;
}

interface SteamSyncSuccess {
  steamId: string;
  unlockedSteamIds: number[];
}

interface SteamSyncErrorBody {
  error?: SteamSyncErrorCode;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class SteamAuthService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(ChecklistStore);

  readonly status = signal<SteamAuthStatus>('idle');
  readonly connected = signal(false);
  readonly toast = signal<SteamToast | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (this.hasConnectedFlag()) {
      this.connected.set(true);
      this.status.set('connected');
    }
  }

  connect(): void {
    this.redirectToSteamLogin();
  }

  redirectToSteamLogin(): void {
    globalThis.open('/api/steam/login', '_self');
  }

  async sync(): Promise<boolean> {
    this.status.set('loading');
    this.clearToast();

    try {
      const result = await firstValueFrom(this.http.get<SteamSyncSuccess>('/api/steam/sync'));
      const added = this.store.importSteamUnlocks(result.unlockedSteamIds);
      this.markConnected();
      this.status.set('connected');
      this.showToast(
        'success',
        added > 0
          ? `Imported ${added} unlocks from Steam.`
          : 'Steam sync complete. No new unlocks.'
      );
      return true;
    } catch (error) {
      const { code, message } = this.resolveError(error);
      this.showToast('error', message);

      if (code === 'not_connected') {
        this.clearConnected();
        this.status.set('idle');
      } else if (this.hasConnectedFlag()) {
        this.status.set('connected');
      } else {
        this.status.set('error');
      }

      return false;
    }
  }

  async logout(): Promise<void> {
    this.status.set('loading');
    this.clearToast();

    try {
      await firstValueFrom(this.http.post<{ ok: boolean }>('/api/steam/logout', {}));
    } catch {
      // Still clear local session if the API is unreachable.
    }

    this.clearConnected();
    this.status.set('idle');
    this.showToast('success', 'Disconnected from Steam.');
  }

  async handleReturnFromSteam(search = this.currentSearch()): Promise<void> {
    const steamFlag = new URLSearchParams(search).get('steam');
    if (!steamFlag) {
      return;
    }

    this.clearSteamQueryParam();

    if (steamFlag === 'connected') {
      await this.sync();
      return;
    }

    this.status.set('error');
    this.showToast('error', 'Steam login was cancelled or failed. Try again.');
  }

  currentSearch(): string {
    return window.location.search;
  }

  clearSteamQueryParam(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('steam');
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, '', next);
  }

  showToast(kind: SteamToastKind, message: string): void {
    this.clearToastTimer();
    this.toast.set({ kind, message });
    this.toastTimer = setTimeout(() => {
      this.toast.set(null);
      this.toastTimer = null;
    }, STEAM_TOAST_MS);
  }

  private clearToast(): void {
    this.clearToastTimer();
    this.toast.set(null);
  }

  private clearToastTimer(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  private resolveError(error: unknown): { code: SteamSyncErrorCode; message: string } {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as SteamSyncErrorBody | null;
      const code = body?.error ?? 'unknown';
      const message =
        body?.message ??
        (error.status === 0
          ? 'Steam sync is unavailable in local development. Use vercel dev.'
          : 'Could not sync Steam achievements.');
      return { code, message };
    }

    return { code: 'unknown', message: 'Could not sync Steam achievements.' };
  }

  private hasConnectedFlag(): boolean {
    return localStorage.getItem(STEAM_CONNECTED_STORAGE_KEY) === '1';
  }

  private markConnected(): void {
    localStorage.setItem(STEAM_CONNECTED_STORAGE_KEY, '1');
    this.connected.set(true);
  }

  private clearConnected(): void {
    localStorage.removeItem(STEAM_CONNECTED_STORAGE_KEY);
    this.connected.set(false);
  }
}
