import { Component, inject } from '@angular/core';

import { ImagePathPipe } from '../pipes/image-path.pipe';
import { ChecklistStore } from '../services/checklist.store';
import { buildEmptyCellIndices, getExtraCellCount, getRowSpan } from '../utils/checklist.utils';

@Component({
  selector: 'app-checklist-desktop',
  imports: [ImagePathPipe],
  templateUrl: './checklist-desktop.component.html',
  styleUrl: './checklist-desktop.component.scss'
})
export class ChecklistDesktopComponent {
  protected readonly store = inject(ChecklistStore);

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
