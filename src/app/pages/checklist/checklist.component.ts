import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import checklistData from './checklist-data.json';

@Component({
  selector: 'app-checklist',
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class ChecklistComponent implements OnInit {
  public characters = checklistData.characters;
  public achievements = checklistData.achievements;
  private unlockedAchievements: string[] = [];

  ngOnInit(): void {
    const saved = localStorage.getItem('unlockedAchievements');
    if (saved) {
      this.unlockedAchievements = JSON.parse(saved);
    }
  }

  public getTierImagePath(tier: number): string {
    return `/assets/icons/quality_${tier}.png`;
  }

  public getExtraCells(achievementsLength: number): number {
    return this.characters.length - achievementsLength;
  }

  public isUnlocked(achievementName: string): boolean {
    return this.unlockedAchievements.includes(achievementName);
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
}
