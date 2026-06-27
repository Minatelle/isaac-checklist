import { Component, inject, OnInit } from '@angular/core';

import { ChecklistStore } from './services/checklist.store';
import {
  buildEmptyCellIndices,
  buildImagePath,
  getExtraCellCount,
  getRowSpan
} from './utils/checklist.utils';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class ChecklistComponent implements OnInit {
  protected readonly store = inject(ChecklistStore);

  ngOnInit(): void {
    this.store.initialize();
  }

  protected getImagePath(folder: string, icon: string): string {
    return buildImagePath(folder, icon);
  }

  protected getRowSpan(achievementIndex: number): number {
    return getRowSpan(achievementIndex, this.store.isTainted());
  }

  protected getEmptyCellIndices(achievementsLength: number, achievementIndex: number): number[] {
    const count = getExtraCellCount(
      achievementsLength,
      achievementIndex,
      this.store.isTainted(),
      this.store.characters().length
    );

    return buildEmptyCellIndices(count);
  }
}
