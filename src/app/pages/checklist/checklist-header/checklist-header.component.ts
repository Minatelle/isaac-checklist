import { Component, HostBinding, inject, output } from '@angular/core';

import { ChecklistStore } from '../services/checklist.store';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: 'app-checklist-header',
  templateUrl: './checklist-header.component.html',
  styleUrl: './checklist-header.component.scss'
})
export class ChecklistHeaderComponent {
  protected readonly store = inject(ChecklistStore);
  protected readonly layout = inject(LayoutService);

  readonly taintedChange = output<boolean>();
  readonly helpClick = output<void>();

  @HostBinding('class.checklist-header--mobile')
  protected get isMobileHeader(): boolean {
    return this.layout.isMobile();
  }
}
