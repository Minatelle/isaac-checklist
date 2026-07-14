import { Component, HostBinding, inject, output } from '@angular/core';

import { ChecklistMode } from '../models/checklist.model';
import { ChecklistStore } from '../services/checklist.store';
import { LayoutService } from '../services/layout.service';
import { SteamAuthService } from '../services/steam-auth.service';

@Component({
  selector: 'app-checklist-header',
  templateUrl: './checklist-header.component.html',
  styleUrls: ['./checklist-header.component.scss', './checklist-header-actions.scss']
})
export class ChecklistHeaderComponent {
  protected readonly store = inject(ChecklistStore);
  protected readonly layout = inject(LayoutService);
  protected readonly steamAuth = inject(SteamAuthService);

  readonly modeChange = output<ChecklistMode>();
  readonly helpClick = output<void>();

  @HostBinding('class.checklist-header--mobile')
  protected get isMobileHeader(): boolean {
    return this.layout.isMobile();
  }

  protected progressLabel(): string {
    const label = `${this.store.achievedUnlocks()}/${this.store.totalUnlocks()}`;
    const percent = `${this.store.achievedPercent()}%`;

    if (this.layout.isMobile()) {
      return `${label} (${percent})`;
    }

    return `${label} achieved (${percent})`;
  }

  protected steamButtonLabel(): string {
    const status = this.steamAuth.status();
    if (status === 'loading') {
      return 'Syncing…';
    }
    if (this.steamAuth.connected()) {
      return 'Sync Steam';
    }
    return 'Connect Steam';
  }

  protected onSteamClick(): void {
    if (this.steamAuth.status() === 'loading') {
      return;
    }

    if (this.steamAuth.connected()) {
      void this.steamAuth.sync();
      return;
    }

    this.steamAuth.connect();
  }

  protected onLogoutClick(): void {
    if (this.steamAuth.status() === 'loading') {
      return;
    }

    void this.steamAuth.logout();
  }
}
