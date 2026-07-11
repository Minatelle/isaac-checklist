import { computed, inject, Injectable, signal } from '@angular/core';

import { Unlock } from '../models/checklist.model';
import {
  countAchievedUnlocks,
  extractSteamIds,
  formatAchievedPercent,
  mergeSteamIds,
  toggleSteamId
} from '../utils/checklist.utils';
import { ChecklistDataService } from './checklist-data.service';
import { UnlockStorageService } from './unlock-storage.service';

@Injectable({ providedIn: 'root' })
export class ChecklistStore {
  private readonly dataService = inject(ChecklistDataService);
  private readonly storage = inject(UnlockStorageService);

  readonly isTainted = signal(false);
  readonly unlockedSteamIds = signal<ReadonlySet<number>>(new Set());
  readonly selectedCharacterIndex = signal(0);

  readonly characters = computed(() => this.dataService.getData(this.isTainted()).characters);
  readonly achievements = computed(() => this.dataService.getData(this.isTainted()).achievements);

  private readonly allSteamIds = computed(() => extractSteamIds(this.achievements()));

  readonly achievedUnlocks = computed(() =>
    countAchievedUnlocks(this.unlockedSteamIds(), this.allSteamIds())
  );

  readonly totalUnlocks = computed(() => this.allSteamIds().length);

  readonly achievedPercent = computed(() =>
    formatAchievedPercent(this.achievedUnlocks(), this.totalUnlocks())
  );

  initialize(): void {
    this.unlockedSteamIds.set(new Set(this.storage.load()));
  }

  setTainted(isTainted: boolean): void {
    this.isTainted.set(isTainted);
    this.selectedCharacterIndex.set(0);
  }

  setSelectedCharacter(characterIndex: number): void {
    this.selectedCharacterIndex.set(characterIndex);
  }

  isUnlocked(unlock: Unlock): boolean {
    return unlock.steamId != null && this.unlockedSteamIds().has(unlock.steamId);
  }

  toggleUnlock(unlock: Unlock): void {
    if (unlock.steamId == null) {
      return;
    }

    const updated = toggleSteamId(this.unlockedSteamIds(), unlock.steamId);
    this.unlockedSteamIds.set(updated);
    this.storage.save(updated);
  }

  importSteamUnlocks(steamIds: Iterable<number>): number {
    const before = this.unlockedSteamIds().size;
    const updated = mergeSteamIds(this.unlockedSteamIds(), steamIds);
    this.unlockedSteamIds.set(updated);
    this.storage.save(updated);
    return updated.size - before;
  }
}
