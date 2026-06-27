import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { ROW_PULSE_MS } from '../constants/checklist.constants';
import { Unlock } from '../models/checklist.model';
import { ImagePathPipe } from '../pipes/image-path.pipe';
import { ChecklistStore } from '../services/checklist.store';
import { LayoutService } from '../services/layout.service';
import {
  buildUnlockAriaLabel,
  countCharacterUnlockProgress,
  formatBossList,
  getUnlockForCharacterIndex
} from '../utils/checklist.utils';
import { SlideTransition } from '../utils/slide-transition';
import { TimedSignal } from '../utils/timed-signal';

type SlideDirection = 'next' | 'prev';

@Component({
  selector: 'app-checklist-mobile',
  imports: [ImagePathPipe, NgTemplateOutlet],
  templateUrl: './checklist-mobile.component.html',
  styleUrl: './checklist-mobile.component.scss'
})
export class ChecklistMobileComponent {
  protected readonly store = inject(ChecklistStore);
  protected readonly layout = inject(LayoutService);
  protected readonly formatBossList = formatBossList;
  protected readonly buildUnlockAriaLabel = buildUnlockAriaLabel;

  protected readonly pickerOpen = signal(false);
  protected readonly pageCharacterIndex = signal(0);

  private readonly destroyRef = inject(DestroyRef);
  private readonly characterSlide = new SlideTransition<SlideDirection>(
    this.destroyRef,
    () => this.layout.prefersReducedMotion()
  );
  private readonly pulseRow = new TimedSignal<string>(this.destroyRef, ROW_PULSE_MS);

  protected readonly slideDirection = this.characterSlide.direction;
  protected readonly slidePhase = this.characterSlide.phase;
  protected readonly pulseRowName = this.pulseRow.value;

  private readonly characterPicker = viewChild.required<ElementRef<HTMLDialogElement>>('characterPicker');
  private readonly achievementList = viewChild<ElementRef<HTMLElement>>('achievementList');

  protected readonly selectedCharacter = computed(
    () => this.store.characters()[this.store.selectedCharacterIndex()]
  );

  protected readonly characterProgress = computed(() =>
    this.getCharacterProgress(this.store.selectedCharacterIndex())
  );

  constructor() {
    effect(() => {
      const index = this.store.selectedCharacterIndex();
      this.store.isTainted();

      if (!this.characterSlide.locked() && this.slidePhase() === 'idle') {
        this.pageCharacterIndex.set(index);
      }
    });
  }

  protected getUnlockForCharacter(achievementIndex: number): Unlock | null {
    return getUnlockForCharacterIndex(
      this.store.achievements(),
      achievementIndex,
      this.pageCharacterIndex(),
      this.store.isTainted(),
      this.store.characters().length
    );
  }

  protected getCharacterProgress(characterIndex: number): { achieved: number; total: number } {
    return countCharacterUnlockProgress(
      this.store.achievements(),
      characterIndex,
      this.store.isTainted(),
      this.store.characters().length,
      this.store.unlockedAchievements()
    );
  }

  protected canSelectPrevious(): boolean {
    return this.store.selectedCharacterIndex() > 0;
  }

  protected canSelectNext(): boolean {
    return this.store.selectedCharacterIndex() < this.store.characters().length - 1;
  }

  protected selectPreviousCharacter(): void {
    this.changeCharacter('prev');
  }

  protected selectNextCharacter(): void {
    this.changeCharacter('next');
  }

  protected toggleUnlock(unlock: Unlock): void {
    this.store.toggleUnlock(unlock.name);
    this.pulseRow.trigger(unlock.name);
  }

  protected openPicker(): void {
    this.characterPicker().nativeElement.showModal();
    this.pickerOpen.set(true);
  }

  protected closePicker(): void {
    const dialog = this.characterPicker().nativeElement;

    if (dialog.open) {
      dialog.close();
    }
  }

  protected onPickerClosed(): void {
    this.pickerOpen.set(false);
  }

  protected selectCharacter(characterIndex: number): void {
    const currentIndex = this.store.selectedCharacterIndex();

    this.closePicker();

    if (characterIndex === currentIndex) {
      return;
    }

    this.changeCharacter(characterIndex > currentIndex ? 'next' : 'prev', characterIndex);
  }

  private changeCharacter(direction: SlideDirection, targetIndex?: number): void {
    const currentIndex = this.store.selectedCharacterIndex();
    const nextIndex =
      targetIndex ?? (direction === 'next' ? currentIndex + 1 : currentIndex - 1);

    if (nextIndex < 0 || nextIndex >= this.store.characters().length || nextIndex === currentIndex) {
      return;
    }

    this.characterSlide.run(
      direction,
      () => {
        this.store.setSelectedCharacter(nextIndex);
        this.pageCharacterIndex.set(nextIndex);
        this.resetListScroll();
      },
      { lock: true }
    );
  }

  private resetListScroll(): void {
    this.achievementList()!.nativeElement.scrollTop = 0;
  }
}
