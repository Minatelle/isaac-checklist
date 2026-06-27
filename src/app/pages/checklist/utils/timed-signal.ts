import { DestroyRef, signal, WritableSignal } from '@angular/core';

export class TimedSignal<T> {
  readonly value: WritableSignal<T | null> = signal(null);

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly destroyRef: DestroyRef,
    private readonly durationMs: number
  ) {
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  trigger(next: T): void {
    this.value.set(next);
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.value.set(null);
      this.timer = null;
    }, this.durationMs);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
