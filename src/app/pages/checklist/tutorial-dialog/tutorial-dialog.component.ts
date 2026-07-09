import { Component, ElementRef, HostBinding, inject, output, viewChild } from '@angular/core';

import { LayoutService } from '../services/layout.service';
import { TutorialStorageService } from '../services/tutorial-storage.service';

@Component({
  selector: 'app-tutorial-dialog',
  templateUrl: './tutorial-dialog.component.html',
  styleUrl: './tutorial-dialog.component.scss'
})
export class TutorialDialogComponent {
  protected readonly layout = inject(LayoutService);

  private readonly tutorialStorage = inject(TutorialStorageService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('tutorialDialog');

  readonly closed = output<void>();

  @HostBinding('class.tutorial-dialog--mobile')
  protected get isMobileDialog(): boolean {
    return this.layout.isMobile();
  }

  open(): void {
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    const element = this.dialog().nativeElement;
    if (!element.open) {
      return;
    }

    element.close();
  }

  protected onDialogClosed(): void {
    this.tutorialStorage.markSeen();
    this.closed.emit();
  }
}
