import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';

import { Unlock } from '../models/checklist.model';
import { ChecklistStore } from '../services/checklist.store';
import {
  buildImagePath,
  countCharacterUnlockProgress,
  getUnlockForCharacterIndex
} from '../utils/checklist.utils';

const CHARACTER_SLIDE_MS = 340;
const ROW_PULSE_MS = 400;

type SlideDirection = 'next' | 'prev';
type SlidePhase = 'idle' | 'enter';

@Component({
  selector: 'app-checklist-mobile',
  templateUrl: './checklist-mobile.component.html',
  styleUrl: './checklist-mobile.component.scss'
})
export class ChecklistMobileComponent {
  protected readonly store = inject(ChecklistStore);
  protected readonly pickerOpen = signal(false);
  protected readonly slideDirection = signal<SlideDirection | null>(null);
  protected readonly slidePhase = signal<SlidePhase>('idle');
  protected readonly pulseRowName = signal<string | null>(null);
  protected readonly pageCharacterIndex = signal(0);

  private readonly characterPicker = viewChild.required<ElementRef<HTMLDialogElement>>('characterPicker');
  private readonly achievementList = viewChild<ElementRef<HTMLElement>>('achievementList');

  private characterChangeLock = false;
  private slideResetTimer: ReturnType<typeof setTimeout> | null = null;
  private pulseResetTimer: ReturnType<typeof setTimeout> | null = null;

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

      if (!this.characterChangeLock && this.slidePhase() === 'idle') {
        this.pageCharacterIndex.set(index);
      }
    });
  }

  protected getImagePath(folder: string, icon: string): string {
    return buildImagePath(folder, icon);
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

  protected formatBossNames(bosses: readonly string[]): string {
    return bosses.join(' · ');
  }

  protected getUnlockAriaLabel(unlock: Unlock): string {
    const state = this.store.isUnlocked(unlock.name) ? 'completed' : 'not completed';
    return `${unlock.name}, ${state}`;
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
    this.pulseRowName.set(unlock.name);

    if (this.pulseResetTimer) {
      clearTimeout(this.pulseResetTimer);
    }

    this.pulseResetTimer = setTimeout(() => {
      this.pulseRowName.set(null);
      this.pulseResetTimer = null;
    }, ROW_PULSE_MS);
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
    if (this.characterChangeLock) {
      return;
    }

    const currentIndex = this.store.selectedCharacterIndex();
    const nextIndex =
      targetIndex ?? (direction === 'next' ? currentIndex + 1 : currentIndex - 1);

    if (nextIndex < 0 || nextIndex >= this.store.characters().length || nextIndex === currentIndex) {
      return;
    }

    if (this.prefersReducedMotion()) {
      this.store.setSelectedCharacter(nextIndex);
      this.pageCharacterIndex.set(nextIndex);
      this.resetListScroll();
      return;
    }

    this.characterChangeLock = true;
    this.slideDirection.set(direction);
    this.store.setSelectedCharacter(nextIndex);
    this.pageCharacterIndex.set(nextIndex);
    this.resetListScroll();
    this.slidePhase.set('enter');

    this.slideResetTimer = setTimeout(() => {
      this.slidePhase.set('idle');
      this.slideDirection.set(null);
      this.characterChangeLock = false;
      this.slideResetTimer = null;
    }, CHARACTER_SLIDE_MS);
  }

  private prefersReducedMotion(): boolean {
    return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private resetListScroll(): void {
    this.achievementList()!.nativeElement.scrollTop = 0;
  }
}
