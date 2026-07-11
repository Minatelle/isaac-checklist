import { Injectable } from '@angular/core';

import { UNLOCKS_STORAGE_KEY } from '../constants/checklist.constants';

@Injectable({ providedIn: 'root' })
export class UnlockStorageService {
  load(): number[] {
    try {
      const saved = localStorage.getItem(UNLOCKS_STORAGE_KEY);
      return saved ? this.parseSteamIds(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  }

  save(steamIds: Iterable<number>): void {
    const sorted = [...new Set(steamIds)].sort((a, b) => a - b);
    localStorage.setItem(UNLOCKS_STORAGE_KEY, JSON.stringify(sorted));
  }

  private parseSteamIds(value: unknown): number[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return [
      ...new Set(
        value
          .map(item => Number(item))
          .filter(id => Number.isInteger(id) && id > 0)
      )
    ].sort((a, b) => a - b);
  }
}
