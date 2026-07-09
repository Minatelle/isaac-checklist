import { Injectable } from '@angular/core';

import { TUTORIAL_SEEN_KEY } from '../constants/checklist.constants';

@Injectable({ providedIn: 'root' })
export class TutorialStorageService {
  hasSeen(): boolean {
    try {
      return localStorage.getItem(TUTORIAL_SEEN_KEY) === 'true';
    } catch {
      return false;
    }
  }

  markSeen(): void {
    try {
      localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    } catch {
      // Ignore storage failures.
    }
  }
}
