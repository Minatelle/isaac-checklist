import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistComponent } from './checklist.component';
import { ChecklistMode } from './models/checklist.model';
import { ChecklistStore } from './services/checklist.store';
import { LayoutService } from './services/layout.service';
import { SteamAuthService } from './services/steam-auth.service';
import { TutorialStorageService } from './services/tutorial-storage.service';

describe('ChecklistComponent', () => {
  let fixture: ComponentFixture<ChecklistComponent>;
  let store: ChecklistStore;
  let view: ChecklistComponent & {
    setMode(mode: ChecklistMode): void;
    modeSlidePhase(): 'idle' | 'enter';
    modeSlideDirection(): 'to-next' | 'to-prev' | null;
    isMobileShell: boolean;
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChecklistComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    jest.spyOn(TestBed.inject(SteamAuthService), 'handleReturnFromSteam').mockResolvedValue();

    fixture = TestBed.createComponent(ChecklistComponent);
    store = TestBed.inject(ChecklistStore);
    view = fixture.componentInstance as typeof view;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
    const layout = TestBed.inject(LayoutService);
    layout.prefersReducedMotion.set(false);
    (globalThis.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));
    localStorage.clear();
  });

  it('initializes the checklist store on init', () => {
    expect(store.totalUnlocks()).toBeGreaterThan(0);
  });

  it('renders the mobile view when layout is mobile', () => {
    TestBed.inject(LayoutService).isMobile.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-checklist-mobile')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-checklist-header .segmented-control')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-checklist-header .segmented-control__thumb')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-checklist-header .progress__bar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-checklist-desktop')).toBeFalsy();
    expect(view.isMobileShell).toBe(true);
  });

  it('renders the desktop view when layout is not mobile', () => {
    TestBed.inject(LayoutService).isMobile.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-checklist-desktop')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-checklist-header .progress__bar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-checklist-mobile')).toBeFalsy();
    expect(view.isMobileShell).toBe(false);
  });

  it('animates switching to tainted mode', () => {
    jest.useFakeTimers();

    view.setMode('tainted');
    fixture.detectChanges();

    expect(store.mode()).toBe('tainted');
    expect(view.modeSlidePhase()).toBe('enter');
    expect(view.modeSlideDirection()).toBe('to-next');

    const body = fixture.nativeElement.querySelector('.checklist-body');
    expect(body.classList.contains('checklist-body--enter')).toBe(true);
    expect(body.classList.contains('checklist-body--to-next')).toBe(true);

    jest.advanceTimersByTime(340);
    fixture.detectChanges();

    expect(view.modeSlidePhase()).toBe('idle');
    expect(view.modeSlideDirection()).toBeNull();
  });

  it('animates switching to challenges mode', () => {
    jest.useFakeTimers();

    view.setMode('challenges');
    fixture.detectChanges();

    expect(store.mode()).toBe('challenges');
    expect(view.modeSlideDirection()).toBe('to-next');
    expect(store.achievements()[0].name).toBe('1. Pitch Black');

    jest.advanceTimersByTime(340);
    fixture.detectChanges();

    expect(view.modeSlidePhase()).toBe('idle');
  });

  it('animates switching back to regular mode', () => {
    jest.useFakeTimers();
    store.setMode('tainted');
    fixture.detectChanges();

    view.setMode('regular');
    fixture.detectChanges();

    expect(store.mode()).toBe('regular');
    expect(view.modeSlideDirection()).toBe('to-prev');

    const body = fixture.nativeElement.querySelector('.checklist-body');
    expect(body.classList.contains('checklist-body--to-prev')).toBe(true);

    jest.advanceTimersByTime(340);
    fixture.detectChanges();

    expect(view.modeSlidePhase()).toBe('idle');
  });

  it('ignores redundant mode changes while animating', () => {
    jest.useFakeTimers();

    view.setMode('tainted');
    view.setMode('regular');

    expect(store.mode()).toBe('tainted');
    expect(view.modeSlidePhase()).toBe('enter');
  });

  it('ignores selecting the mode that is already active', () => {
    expect(store.mode()).toBe('regular');

    view.setMode('regular');

    expect(view.modeSlidePhase()).toBe('idle');
    expect(view.modeSlideDirection()).toBeNull();
  });

  it('switches mode instantly when reduced motion is preferred', () => {
    TestBed.inject(LayoutService).prefersReducedMotion.set(true);

    view.setMode('tainted');

    expect(store.mode()).toBe('tainted');
    expect(view.modeSlidePhase()).toBe('idle');
    expect(view.modeSlideDirection()).toBeNull();
  });

  it('switches mode from segmented control buttons on mobile', () => {
    jest.useFakeTimers();
    TestBed.inject(LayoutService).isMobile.set(true);
    fixture.detectChanges();

    const segments = fixture.nativeElement.querySelectorAll(
      'app-checklist-header .segment'
    ) as NodeListOf<HTMLButtonElement>;
    segments[1].click();
    fixture.detectChanges();

    expect(store.mode()).toBe('tainted');

    const thumb = fixture.nativeElement.querySelector('app-checklist-header .segmented-control__thumb');
    expect(thumb.classList.contains('segmented-control__thumb--tainted')).toBe(true);

    jest.advanceTimersByTime(340);
    fixture.detectChanges();

    segments[2].click();
    fixture.detectChanges();

    expect(store.mode()).toBe('challenges');
    expect(thumb.classList.contains('segmented-control__thumb--challenges')).toBe(true);
  });

  it('auto-opens the tutorial on first visit', () => {
    jest.useFakeTimers();

    const localFixture = TestBed.createComponent(ChecklistComponent);
    localFixture.detectChanges();

    const tutorialDialog = localFixture.nativeElement.querySelector('app-tutorial-dialog dialog') as HTMLDialogElement;
    const showModal = jest.spyOn(tutorialDialog, 'showModal');

    jest.advanceTimersByTime(0);
    localFixture.detectChanges();

    expect(showModal).toHaveBeenCalled();
  });

  it('does not auto-open the tutorial when it has already been seen', () => {
    jest.useFakeTimers();
    TestBed.inject(TutorialStorageService).markSeen();

    fixture = TestBed.createComponent(ChecklistComponent);
    fixture.detectChanges();

    const tutorialDialog = fixture.nativeElement.querySelector('app-tutorial-dialog dialog') as HTMLDialogElement;
    const showModal = jest.spyOn(tutorialDialog, 'showModal');

    jest.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(showModal).not.toHaveBeenCalled();
  });

  it('reopens the tutorial when help button is clicked', () => {
    TestBed.inject(TutorialStorageService).markSeen();
    fixture.detectChanges();

    const tutorialDialog = fixture.nativeElement.querySelector('app-tutorial-dialog dialog') as HTMLDialogElement;
    const showModal = jest.spyOn(tutorialDialog, 'showModal');

    const helpButton = fixture.nativeElement.querySelector('app-checklist-header .help-button') as HTMLButtonElement;
    helpButton.click();

    expect(showModal).toHaveBeenCalled();
  });
});
