import { DestroyRef, inject, Injectable, signal } from '@angular/core';

import { MOBILE_BREAKPOINT } from '../constants/checklist.constants';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly destroyRef = inject(DestroyRef);

  readonly isMobile = signal(this.matchesMobile());

  constructor() {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const onChange = () => this.isMobile.set(mediaQuery.matches);

    mediaQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', onChange));
  }

  private matchesMobile(): boolean {
    return window.matchMedia(MOBILE_BREAKPOINT).matches;
  }
}
