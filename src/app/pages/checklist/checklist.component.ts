import { Component, OnInit, computed, signal } from '@angular/core';
import checklistData from './checklist-data.json';
import checklistTaintedData from './checklist-tainted-data.json';

type Character = (typeof checklistData)['characters'][number];
type Achievement = (typeof checklistData)['achievements'][number];

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class ChecklistComponent implements OnInit {
  readonly characters = signal<Character[]>(checklistData.characters);
  readonly achievements = signal<Achievement[]>(checklistData.achievements);
  readonly isTainted = signal(false);
  readonly unlockedAchievements = signal<string[]>([]);

  readonly achievedUnlocks = computed(
    () =>
      this.unlockedAchievements().filter(name => this.getAllUnlockNames().includes(name)).length
  );

  readonly totalUnlocks = computed(() => this.getAllUnlockNames().length);

  readonly achievedPercent = computed(() => {
    const total = this.totalUnlocks();
    if (total === 0) {
      return '0.0';
    }
    const percent = (this.achievedUnlocks() / total) * 100;
    return percent.toFixed(1);
  });

  ngOnInit(): void {
    const saved = localStorage.getItem('unlockedAchievements');
    if (saved) {
      this.unlockedAchievements.set(JSON.parse(saved));
    }
    this.setChecklistData();
  }

  private getAllUnlockNames(): string[] {
    return this.achievements().flatMap(achievement =>
      achievement.unlocks.map(unlock => unlock.name)
    );
  }

  getRowSpan(index: number): number {
    if (!this.isTainted()) {
      return 1;
    }

    switch (index) {
      case 1:
        return 4;
      case 6:
        return 2;
      default:
        return 1;
    }
  }

  getImagePath(folder: string, icon: string): string {
    return `/assets/icons/${folder}/${icon}.png`;
  }

  getEmptyCellIndices(achievementsLength: number, index: number): number[] {
    const count = this.getExtraCells(achievementsLength, index);
    return Array.from({ length: count }, (_, i) => i);
  }

  private getExtraCells(achievementsLength: number, index: number): number {
    if (this.isTainted() && ![0, 8, 13].includes(index)) {
      return 1;
    }
    return this.characters().length - achievementsLength;
  }

  isUnlocked(achievementName: string): boolean {
    return this.unlockedAchievements().includes(achievementName);
  }

  setTainted(isTainted: boolean): void {
    this.isTainted.set(isTainted);
    this.setChecklistData();
  }

  lockUnlock(achievementName: string): void {
    this.unlockedAchievements.update(list =>
      list.includes(achievementName)
        ? list.filter(name => name !== achievementName)
        : [...list, achievementName]
    );
    localStorage.setItem('unlockedAchievements', JSON.stringify(this.unlockedAchievements()));
  }

  private setChecklistData(): void {
    const data = this.isTainted() ? checklistTaintedData : checklistData;

    this.characters.set(data.characters);
    this.achievements.set(data.achievements);
  }
}
