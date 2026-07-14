import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistHeaderComponent } from './checklist-header.component';
import { ChecklistStore } from '../services/checklist.store';
import { LayoutService } from '../services/layout.service';
import { SteamAuthService } from '../services/steam-auth.service';

describe('ChecklistHeaderComponent', () => {
  let fixture: ComponentFixture<ChecklistHeaderComponent>;
  let store: ChecklistStore;
  let steamAuth: SteamAuthService;
  let view: ChecklistHeaderComponent & {
    steamButtonLabel(): string;
    progressLabel(): string;
    onSteamClick(): void;
    onLogoutClick(): void;
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChecklistHeaderComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistHeaderComponent);
    view = fixture.componentInstance as typeof view;
    store = TestBed.inject(ChecklistStore);
    steamAuth = TestBed.inject(SteamAuthService);
    store.initialize();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders segmented control on mobile', () => {
    TestBed.inject(LayoutService).isMobile.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.segmented-control')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.progress__bar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.tabs')).toBeFalsy();
    expect(view.progressLabel()).not.toContain('achieved');
  });

  it('renders desktop tabs when not mobile', () => {
    TestBed.inject(LayoutService).isMobile.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.tabs')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.progress__bar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.segmented-control')).toBeFalsy();
    expect(view.progressLabel()).toContain('achieved');
  });

  it('emits modeChange when a segment is selected', () => {
    TestBed.inject(LayoutService).isMobile.set(true);
    fixture.detectChanges();

    const emit = jest.fn();
    fixture.componentInstance.modeChange.subscribe(emit);

    const segments = fixture.nativeElement.querySelectorAll('.segment') as NodeListOf<HTMLButtonElement>;
    segments[1].click();
    expect(emit).toHaveBeenCalledWith('tainted');

    segments[2].click();
    expect(emit).toHaveBeenCalledWith('challenges');
  });

  it('renders help button on mobile and emits helpClick', () => {
    TestBed.inject(LayoutService).isMobile.set(true);
    fixture.detectChanges();

    const helpButton = fixture.nativeElement.querySelector('.help-button') as HTMLButtonElement;
    expect(helpButton).toBeTruthy();
    expect(helpButton.getAttribute('aria-label')).toBe('Open tutorial');
    expect(helpButton.querySelector('.material-symbols-outlined')?.textContent?.trim()).toBe('help');

    const emit = jest.fn();
    fixture.componentInstance.helpClick.subscribe(emit);
    helpButton.click();

    expect(emit).toHaveBeenCalled();
  });

  it('renders help button on desktop and emits helpClick', () => {
    TestBed.inject(LayoutService).isMobile.set(false);
    fixture.detectChanges();

    const helpButton = fixture.nativeElement.querySelector('.help-button') as HTMLButtonElement;
    expect(helpButton).toBeTruthy();

    const emit = jest.fn();
    fixture.componentInstance.helpClick.subscribe(emit);
    helpButton.click();

    expect(emit).toHaveBeenCalled();
  });

  it('renders connect steam button and starts login', () => {
    const connect = jest.spyOn(steamAuth, 'connect').mockImplementation(() => undefined);
    const button = fixture.nativeElement.querySelector('.steam-button') as HTMLButtonElement;

    expect(button.textContent?.trim()).toBe('Connect Steam');
    button.click();
    expect(connect).toHaveBeenCalled();
  });

  it('syncs when already connected', () => {
    steamAuth.connected.set(true);
    steamAuth.status.set('connected');
    fixture.detectChanges();

    const sync = jest.spyOn(steamAuth, 'sync').mockResolvedValue(true);
    const button = fixture.nativeElement.querySelector('.steam-button') as HTMLButtonElement;

    expect(button.textContent).toContain('Sync Steam');
    expect(button.querySelector('.material-symbols-outlined')?.textContent?.trim()).toBe('sync');
    button.click();
    expect(sync).toHaveBeenCalled();
  });

  it('shows disconnect only when connected', () => {
    expect(fixture.nativeElement.querySelector('.steam-button--logout')).toBeFalsy();

    steamAuth.connected.set(true);
    steamAuth.status.set('connected');
    fixture.detectChanges();

    const logout = jest.spyOn(steamAuth, 'logout').mockResolvedValue();
    const button = fixture.nativeElement.querySelector('.steam-button--logout') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('Logout from Steam');
    expect(button.querySelector('.material-symbols-outlined')?.textContent?.trim()).toBe('logout');
    button.click();
    expect(logout).toHaveBeenCalled();
  });

  it('ignores logout clicks while loading', () => {
    steamAuth.connected.set(true);
    steamAuth.status.set('loading');
    fixture.detectChanges();

    const logout = jest.spyOn(steamAuth, 'logout');
    view.onLogoutClick();
    expect(logout).not.toHaveBeenCalled();
  });

  it('shows syncing label and ignores clicks while loading', () => {
    steamAuth.status.set('loading');
    fixture.detectChanges();

    expect(view.steamButtonLabel()).toBe('Syncing…');
    const connect = jest.spyOn(steamAuth, 'connect');
    const sync = jest.spyOn(steamAuth, 'sync');
    view.onSteamClick();
    expect(connect).not.toHaveBeenCalled();
    expect(sync).not.toHaveBeenCalled();
  });

  it('shows steam toast feedback', () => {
    steamAuth.toast.set({ kind: 'error', message: 'Profile is private' });
    fixture.detectChanges();

    const toast = fixture.nativeElement.querySelector('.steam-toast') as HTMLElement;
    expect(toast.classList.contains('steam-toast--error')).toBe(true);
    expect(toast.textContent).toContain('Profile is private');
  });

  it('shows success toast feedback', () => {
    steamAuth.toast.set({ kind: 'success', message: 'Imported 3 unlocks from Steam.' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.steam-toast')?.textContent).toContain(
      'Imported 3 unlocks'
    );
  });
});
