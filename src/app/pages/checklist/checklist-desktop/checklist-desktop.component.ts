import { Component, inject } from '@angular/core';

import { ImagePathPipe } from '../pipes/image-path.pipe';
import { ChecklistStore } from '../services/checklist.store';
import {
  buildEmptyCellIndices,
  buildUnlockAriaLabel,
  formatBossList,
  getChallengeDlc,
  getChallengeDlcBadgeIcon,
  getChallengeDlcLabel,
  getExtraCellCount,
  getRowSpan,
  parseChallengeName
} from '../utils/checklist.utils';

@Component({
  selector: 'app-checklist-desktop',
  imports: [ImagePathPipe],
  templateUrl: './checklist-desktop.component.html',
  styleUrl: './checklist-desktop.component.scss'
})
export class ChecklistDesktopComponent {
  protected readonly store = inject(ChecklistStore);
  protected readonly formatBossList = formatBossList;
  protected readonly buildUnlockAriaLabel = buildUnlockAriaLabel;
  protected readonly parseChallengeName = parseChallengeName;
  protected readonly getChallengeDlc = getChallengeDlc;
  protected readonly getChallengeDlcBadgeIcon = getChallengeDlcBadgeIcon;
  protected readonly getChallengeDlcLabel = getChallengeDlcLabel;

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
