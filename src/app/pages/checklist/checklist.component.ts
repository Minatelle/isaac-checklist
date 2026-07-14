import { Component, DestroyRef, HostBinding, inject, OnInit, viewChild } from '@angular/core';

import { CHECKLIST_MODES } from './constants/checklist.constants';
import { ChecklistHeaderComponent } from './checklist-header/checklist-header.component';
import { ChecklistDesktopComponent } from './checklist-desktop/checklist-desktop.component';
import { ChecklistMobileComponent } from './checklist-mobile/checklist-mobile.component';
import { ChecklistMode } from './models/checklist.model';
import { TutorialDialogComponent } from './tutorial-dialog/tutorial-dialog.component';
import { ChecklistStore } from './services/checklist.store';
import { LayoutService } from './services/layout.service';
import { SteamAuthService } from './services/steam-auth.service';
import { TutorialStorageService } from './services/tutorial-storage.service';
import { SlideTransition } from './utils/slide-transition';

type ModeSlideDirection = 'to-next' | 'to-prev';

@Component({
  selector: 'app-checklist',
  imports: [
    ChecklistHeaderComponent,
    ChecklistDesktopComponent,
    ChecklistMobileComponent,
    TutorialDialogComponent
  ],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss'
})
export class ChecklistComponent implements OnInit {
  protected readonly store = inject(ChecklistStore);
  protected readonly layout = inject(LayoutService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly steamAuth = inject(SteamAuthService);
  private readonly tutorialStorage = inject(TutorialStorageService);
  private readonly tutorialDialog = viewChild.required(TutorialDialogComponent);
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
    void this.steamAuth.handleReturnFromSteam();

    if (!this.tutorialStorage.hasSeen()) {
      setTimeout(() => this.tutorialDialog().open());
    }
  }

  protected openTutorial(): void {
    this.tutorialDialog().open();
  }

  protected setMode(mode: ChecklistMode): void {
    if (this.store.mode() === mode) {
      return;
    }

    const currentIndex = CHECKLIST_MODES.indexOf(this.store.mode());
    const nextIndex = CHECKLIST_MODES.indexOf(mode);
    const direction: ModeSlideDirection = nextIndex > currentIndex ? 'to-next' : 'to-prev';
    this.modeSlide.run(direction, () => this.store.setMode(mode));
  }
}
