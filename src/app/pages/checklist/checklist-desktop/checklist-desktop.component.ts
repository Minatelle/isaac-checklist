import { Component, inject } from '@angular/core';

import { ChecklistStore } from '../services/checklist.store';
import {
  buildEmptyCellIndices,
  buildImagePath,
  getExtraCellCount,
  getRowSpan
} from '../utils/checklist.utils';

@Component({
  selector: 'app-checklist-desktop',
  templateUrl: './checklist-desktop.component.html',
  styleUrl: './checklist-desktop.component.scss'
})
export class ChecklistDesktopComponent {
  protected readonly store = inject(ChecklistStore);

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
