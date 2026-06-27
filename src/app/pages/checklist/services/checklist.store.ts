import { computed, inject, Injectable, signal } from '@angular/core';

import {
  countAchievedUnlocks,
  extractUnlockNames,
  formatAchievedPercent,
  toggleUnlockName
} from '../utils/checklist.utils';
import { ChecklistDataService } from './checklist-data.service';
import { UnlockStorageService } from './unlock-storage.service';

@Injectable({ providedIn: 'root' })
export class ChecklistStore {
  private readonly dataService = inject(ChecklistDataService);
  private readonly storage = inject(UnlockStorageService);

  readonly isTainted = signal(false);
  readonly unlockedAchievements = signal<string[]>([]);
  readonly selectedCharacterIndex = signal(0);

  readonly characters = computed(() => this.dataService.getData(this.isTainted()).characters);
  readonly achievements = computed(() => this.dataService.getData(this.isTainted()).achievements);

  private readonly allUnlockNames = computed(() => extractUnlockNames(this.achievements()));

  readonly achievedUnlocks = computed(() =>
    countAchievedUnlocks(this.unlockedAchievements(), this.allUnlockNames())
  );

  readonly totalUnlocks = computed(() => this.allUnlockNames().length);

  readonly achievedPercent = computed(() =>
    formatAchievedPercent(this.achievedUnlocks(), this.totalUnlocks())
  );

  initialize(): void {
    this.unlockedAchievements.set(this.storage.load());
  }

  setTainted(isTainted: boolean): void {
    this.isTainted.set(isTainted);
    this.selectedCharacterIndex.set(0);
  }

  setSelectedCharacter(characterIndex: number): void {
    this.selectedCharacterIndex.set(characterIndex);
  }

  isUnlocked(achievementName: string): boolean {
    return this.unlockedAchievements().includes(achievementName);
  }

  toggleUnlock(achievementName: string): void {
    const updated = toggleUnlockName(this.unlockedAchievements(), achievementName);
    this.unlockedAchievements.set(updated);
    this.storage.save(updated);
  }
}
