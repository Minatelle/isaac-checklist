import { Component, DestroyRef, HostBinding, inject, OnInit } from '@angular/core';

import { ChecklistHeaderComponent } from './checklist-header/checklist-header.component';
import { ChecklistDesktopComponent } from './checklist-desktop/checklist-desktop.component';
import { ChecklistMobileComponent } from './checklist-mobile/checklist-mobile.component';
import { ChecklistStore } from './services/checklist.store';
import { LayoutService } from './services/layout.service';
import { SlideTransition } from './utils/slide-transition';

type ModeSlideDirection = 'to-regular' | 'to-tainted';

@Component({
  selector: 'app-checklist',
  imports: [ChecklistHeaderComponent, ChecklistDesktopComponent, ChecklistMobileComponent],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class ChecklistComponent implements OnInit {
  protected readonly store = inject(ChecklistStore);
  protected readonly layout = inject(LayoutService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly modeSlide = new SlideTransition<ModeSlideDirection>(
    this.destroyRef,
    () => this.layout.prefersReducedMotion()
  );

  protected readonly modeSlidePhase = this.modeSlide.phase;
  protected readonly modeSlideDirection = this.modeSlide.direction;

  @HostBinding('class.checklist-shell--mobile')
  protected get isMobileShell(): boolean {
    return this.layout.isMobile();
  }

  ngOnInit(): void {
    this.store.initialize();
  }

  protected setTainted(isTainted: boolean): void {
    if (this.store.isTainted() === isTainted) {
      return;
    }

    const direction: ModeSlideDirection = isTainted ? 'to-tainted' : 'to-regular';
    this.modeSlide.run(direction, () => this.store.setTainted(isTainted));
  }
}
