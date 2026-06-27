import { Injectable } from '@angular/core';

import { UNLOCKS_STORAGE_KEY } from '../constants/checklist.constants';

@Injectable({ providedIn: 'root' })
export class UnlockStorageService {
  load(): string[] {
    try {
      const saved = localStorage.getItem(UNLOCKS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  save(unlocks: readonly string[]): void {
    localStorage.setItem(UNLOCKS_STORAGE_KEY, JSON.stringify(unlocks));
  }
}
