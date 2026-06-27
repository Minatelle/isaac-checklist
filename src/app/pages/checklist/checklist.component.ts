import { Component, HostBinding, inject, OnInit, signal } from '@angular/core';

import { ChecklistDesktopComponent } from './checklist-desktop/checklist-desktop.component';
import { ChecklistMobileComponent } from './checklist-mobile/checklist-mobile.component';
import { ChecklistStore } from './services/checklist.store';
import { LayoutService } from './services/layout.service';

const MODE_SLIDE_MS = 340;

type ModeSlideDirection = 'to-regular' | 'to-tainted';
type ModeSlidePhase = 'idle' | 'enter';

@Component({
  selector: 'app-checklist',
  imports: [ChecklistDesktopComponent, ChecklistMobileComponent],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class ChecklistComponent implements OnInit {
  protected readonly store = inject(ChecklistStore);
  protected readonly layout = inject(LayoutService);
  protected readonly modeSlidePhase = signal<ModeSlidePhase>('idle');
  protected readonly modeSlideDirection = signal<ModeSlideDirection | null>(null);

  private modeSlideResetTimer: ReturnType<typeof setTimeout> | null = null;

  @HostBinding('class.checklist-shell--mobile')
  protected get isMobileShell(): boolean {
    return this.layout.isMobile();
  }

  ngOnInit(): void {
    this.store.initialize();
  }

  protected setTainted(isTainted: boolean): void {
    if (this.store.isTainted() === isTainted || this.modeSlidePhase() === 'enter') {
      return;
    }

    if (this.prefersReducedMotion()) {
      this.store.setTainted(isTainted);
      return;
    }

    this.modeSlideDirection.set(isTainted ? 'to-tainted' : 'to-regular');
    this.store.setTainted(isTainted);
    this.modeSlidePhase.set('enter');

    this.modeSlideResetTimer = setTimeout(() => {
      this.modeSlidePhase.set('idle');
      this.modeSlideDirection.set(null);
      this.modeSlideResetTimer = null;
    }, MODE_SLIDE_MS);
  }

  private prefersReducedMotion(): boolean {
    return globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
