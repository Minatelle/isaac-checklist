import { DestroyRef, signal } from '@angular/core';

import { SLIDE_TRANSITION_MS } from '../constants/checklist.constants';

export type SlidePhase = 'idle' | 'enter';

export interface SlideTransitionOptions {
  lock?: boolean;
}

export class SlideTransition<TDirection extends string> {
  readonly phase = signal<SlidePhase>('idle');
  readonly direction = signal<TDirection | null>(null);
  readonly locked = signal(false);

  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly destroyRef: DestroyRef,
    private readonly prefersReducedMotion: () => boolean,
    private readonly durationMs = SLIDE_TRANSITION_MS
  ) {
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  isAnimating(): boolean {
    return this.phase() === 'enter' || this.locked();
  }

  run(direction: TDirection, action: () => void, options?: SlideTransitionOptions): boolean {
    if (this.isAnimating()) {
      return false;
    }

    if (this.prefersReducedMotion()) {
      action();
      return true;
    }

    if (options?.lock) {
      this.locked.set(true);
    }

    this.direction.set(direction);
    action();
    this.phase.set('enter');
    this.scheduleReset();

    return true;
  }

  private scheduleReset(): void {
    this.clearTimer();
    this.resetTimer = setTimeout(() => this.reset(), this.durationMs);
  }

  private reset(): void {
    this.phase.set('idle');
    this.direction.set(null);
    this.locked.set(false);
    this.resetTimer = null;
  }

  private clearTimer(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}
