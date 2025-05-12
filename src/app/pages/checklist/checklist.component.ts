import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import checklistData from './checklist-data.json';
import checklistTaintedData from './checklist-tainted-data.json';

@Component({
  selector: 'app-checklist',
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class ChecklistComponent implements OnInit {
  public characters = checklistData.characters;
  public achievements = checklistData.achievements;
  public isTainted: boolean = false;
  public unlockedAchievements: string[] = [];

  ngOnInit(): void {
    const saved = localStorage.getItem('unlockedAchievements');
    if (saved) {
      this.unlockedAchievements = JSON.parse(saved);
    }
    this.setChecklistData();
  }

  public getTotalUnlocks(): number {
    return this.achievements.flatMap(achievement => achievement.unlocks).length;
  }

  public getAchievedPercent(): string {
    return ((this.unlockedAchievements.length / this.getTotalUnlocks()) * 100).toFixed(1);
  }

  public getRowSpan(index: number): number {
    if (!this.isTainted) {
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

  public getTierImagePath(tier: number): string {
    return `/assets/icons/quality_${tier}.png`;
  }

  public getExtraCells(achievementsLength: number, index: number): number {
    if (this.isTainted && ![0, 8, 13].includes(index)) {
      return 1;
    }
    return this.characters.length - achievementsLength;
  }

  public isUnlocked(achievementName: string): boolean {
    return this.unlockedAchievements.includes(achievementName);
  }

  public setTainted(isTainted: boolean): void {
    this.isTainted = isTainted;
    this.setChecklistData();
  }

  public lockUnlock(achievementName: string): void {
    if (!this.isUnlocked(achievementName)) {
      this.unlockedAchievements.push(achievementName);
    } else {
      const removeIndex = this.unlockedAchievements.indexOf(achievementName);
      this.unlockedAchievements.splice(removeIndex, 1);
    }
    localStorage.setItem('unlockedAchievements', JSON.stringify(this.unlockedAchievements));
  }

  private setChecklistData() {
    const data = this.isTainted ? checklistTaintedData : checklistData;

    this.characters = data.characters;
    this.achievements = data.achievements;
  }
}
