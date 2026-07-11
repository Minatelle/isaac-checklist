import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  STEAM_CONNECTED_STORAGE_KEY,
  STEAM_TOAST_MS
} from '../constants/checklist.constants';
import { ChecklistStore } from './checklist.store';
import { SteamAuthService } from './steam-auth.service';

describe('SteamAuthService', () => {
  let service: SteamAuthService;
  let httpMock: HttpTestingController;
  let store: ChecklistStore;

  function setup(): void {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    store = TestBed.inject(ChecklistStore);
    store.initialize();
    service = TestBed.inject(SteamAuthService);
    httpMock = TestBed.inject(HttpTestingController);
    jest.spyOn(service, 'clearSteamQueryParam').mockImplementation(() => undefined);
  }

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    jest.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('restores connected status from localStorage', () => {
    localStorage.setItem(STEAM_CONNECTED_STORAGE_KEY, '1');
    setup();
    expect(service.status()).toBe('connected');
    expect(service.connected()).toBe(true);
  });

  it('redirects to steam login on connect', () => {
    setup();
    const redirect = jest.spyOn(service, 'redirectToSteamLogin').mockImplementation(() => undefined);
    service.connect();
    expect(redirect).toHaveBeenCalled();
  });

  it('opens the steam login url', () => {
    setup();
    const open = jest.spyOn(globalThis, 'open').mockImplementation(() => null);
    service.redirectToSteamLogin();
    expect(open).toHaveBeenCalledWith('/api/steam/login', '_self');
    open.mockRestore();
  });

  it('syncs achievements and shows an import toast', async () => {
    setup();
    const syncPromise = service.sync();

    const req = httpMock.expectOne('/api/steam/sync');
    expect(req.request.method).toBe('GET');
    req.flush({ steamId: '76561198000000000', unlockedSteamIds: [167, 168] });

    await expect(syncPromise).resolves.toBe(true);
    expect(service.status()).toBe('connected');
    expect(service.connected()).toBe(true);
    expect(service.toast()).toEqual({
      kind: 'success',
      message: 'Imported 2 unlocks from Steam.'
    });
    expect(localStorage.getItem(STEAM_CONNECTED_STORAGE_KEY)).toBe('1');
    expect(store.unlockedSteamIds().has(167)).toBe(true);

    jest.advanceTimersByTime(STEAM_TOAST_MS);
    expect(service.toast()).toBeNull();
  });

  it('shows a toast when sync finds no new unlocks', async () => {
    setup();
    const syncPromise = service.sync();
    httpMock.expectOne('/api/steam/sync').flush({
      steamId: '76561198000000000',
      unlockedSteamIds: []
    });

    await expect(syncPromise).resolves.toBe(true);
    expect(service.toast()?.message).toContain('No new unlocks');
  });

  it('handles private profile errors while remaining connected', async () => {
    localStorage.setItem(STEAM_CONNECTED_STORAGE_KEY, '1');
    setup();

    const syncPromise = service.sync();
    httpMock.expectOne('/api/steam/sync').flush(
      {
        error: 'private_profile',
        message: 'Your Steam game details are private.'
      },
      { status: 403, statusText: 'Forbidden' }
    );

    await expect(syncPromise).resolves.toBe(false);
    expect(service.status()).toBe('connected');
    expect(service.toast()).toEqual({
      kind: 'error',
      message: 'Your Steam game details are private.'
    });
  });

  it('clears connected state when sync returns not_connected', async () => {
    localStorage.setItem(STEAM_CONNECTED_STORAGE_KEY, '1');
    setup();

    const syncPromise = service.sync();
    httpMock.expectOne('/api/steam/sync').flush(
      { error: 'not_connected', message: 'Connect your Steam account first.' },
      { status: 401, statusText: 'Unauthorized' }
    );

    await expect(syncPromise).resolves.toBe(false);
    expect(service.status()).toBe('idle');
    expect(service.connected()).toBe(false);
    expect(localStorage.getItem(STEAM_CONNECTED_STORAGE_KEY)).toBeNull();
  });

  it('logs out and clears the steam session', async () => {
    localStorage.setItem(STEAM_CONNECTED_STORAGE_KEY, '1');
    setup();

    const logoutPromise = service.logout();
    const req = httpMock.expectOne('/api/steam/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });

    await logoutPromise;
    expect(service.status()).toBe('idle');
    expect(service.connected()).toBe(false);
    expect(localStorage.getItem(STEAM_CONNECTED_STORAGE_KEY)).toBeNull();
    expect(service.toast()?.message).toContain('Disconnected');
  });

  it('logs out locally even if the logout api fails', async () => {
    localStorage.setItem(STEAM_CONNECTED_STORAGE_KEY, '1');
    setup();

    const logoutPromise = service.logout();
    httpMock.expectOne('/api/steam/logout').error(new ProgressEvent('error'));

    await logoutPromise;
    expect(service.connected()).toBe(false);
    expect(service.status()).toBe('idle');
  });

  it('handles steam return connected query', async () => {
    setup();

    const returnPromise = service.handleReturnFromSteam('?steam=connected');
    httpMock.expectOne('/api/steam/sync').flush({
      steamId: '76561198000000000',
      unlockedSteamIds: [167]
    });

    await returnPromise;
    expect(service.clearSteamQueryParam).toHaveBeenCalled();
    expect(service.status()).toBe('connected');
  });

  it('handles steam return error query', async () => {
    setup();

    await service.handleReturnFromSteam('?steam=error');

    expect(service.status()).toBe('error');
    expect(service.toast()?.message).toContain('cancelled or failed');
    expect(service.clearSteamQueryParam).toHaveBeenCalled();
  });

  it('ignores pages without steam query', async () => {
    setup();
    await service.handleReturnFromSteam('');
    expect(service.status()).toBe('idle');
    expect(service.clearSteamQueryParam).not.toHaveBeenCalled();
  });

  it('uses the current search when no argument is provided', async () => {
    setup();
    jest.spyOn(service, 'currentSearch').mockReturnValue('');
    await service.handleReturnFromSteam();
    expect(service.currentSearch).toHaveBeenCalled();
  });

  it('reads the current window search', () => {
    setup();
    expect(typeof service.currentSearch()).toBe('string');
  });

  it('maps network errors to a local development message', async () => {
    setup();
    const syncPromise = service.sync();
    httpMock.expectOne('/api/steam/sync').error(new ProgressEvent('error'));

    await expect(syncPromise).resolves.toBe(false);
    expect(service.status()).toBe('error');
    expect(service.toast()?.message).toContain('vercel dev');
  });

  it('maps unknown http errors to a generic message', async () => {
    setup();
    const syncPromise = service.sync();
    httpMock.expectOne('/api/steam/sync').flush('nope', { status: 500, statusText: 'Server Error' });

    await expect(syncPromise).resolves.toBe(false);
    expect(service.status()).toBe('error');
    expect(service.toast()?.message).toBe('Could not sync Steam achievements.');
  });

  it('maps non-http errors to a generic message', async () => {
    setup();
    jest.spyOn(service['http'], 'get').mockImplementation(() => {
      throw new Error('boom');
    });

    await expect(service.sync()).resolves.toBe(false);
    expect(service.toast()?.message).toBe('Could not sync Steam achievements.');
  });

  it('clears the steam query param from the url', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SteamAuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const replaceState = jest.spyOn(window.history, 'replaceState').mockImplementation(() => undefined);
    service.clearSteamQueryParam();
    expect(replaceState).toHaveBeenCalled();
    replaceState.mockRestore();
  });

  it('replaces an existing toast timer when showing another toast', () => {
    setup();
    service.showToast('success', 'first');
    service.showToast('error', 'second');
    expect(service.toast()?.message).toBe('second');
    jest.advanceTimersByTime(STEAM_TOAST_MS);
    expect(service.toast()).toBeNull();
  });
});
