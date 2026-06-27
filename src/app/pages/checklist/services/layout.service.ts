import { DestroyRef, inject, Injectable, signal } from '@angular/core';

import { MOBILE_BREAKPOINT, REDUCED_MOTION_QUERY } from '../constants/checklist.constants';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly destroyRef = inject(DestroyRef);

  readonly isMobile = signal(this.readMediaQuery(MOBILE_BREAKPOINT));
  readonly prefersReducedMotion = signal(this.readMediaQuery(REDUCED_MOTION_QUERY));

  constructor() {
    this.watchMediaQuery(MOBILE_BREAKPOINT, matches => this.isMobile.set(matches));
    this.watchMediaQuery(REDUCED_MOTION_QUERY, matches => this.prefersReducedMotion.set(matches));
  }

  private watchMediaQuery(query: string, onChange: (matches: boolean) => void): void {
    const mediaQuery = window.matchMedia(query);
    const listener = () => onChange(mediaQuery.matches);

    mediaQuery.addEventListener('change', listener);
    this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', listener));
  }

  private readMediaQuery(query: string): boolean {
    return window.matchMedia(query).matches;
  }
}
