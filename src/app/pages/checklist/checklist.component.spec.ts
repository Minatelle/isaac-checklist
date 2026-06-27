import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistComponent } from './checklist.component';
import { ChecklistStore } from './services/checklist.store';
import { LayoutService } from './services/layout.service';

describe('ChecklistComponent', () => {
  let fixture: ComponentFixture<ChecklistComponent>;
  let store: ChecklistStore;
  let view: ChecklistComponent & {
    setTainted(isTainted: boolean): void;
    modeSlidePhase(): 'idle' | 'enter';
    modeSlideDirection(): 'to-regular' | 'to-tainted' | null;
    isMobileShell: boolean;
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChecklistComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistComponent);
    store = TestBed.inject(ChecklistStore);
    view = fixture.componentInstance as typeof view;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
    const layout = TestBed.inject(LayoutService);
    layout.prefersReducedMotion.set(false);
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
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
    expect(fixture.nativeElement.querySelector('app-checklist-mobile')).toBeFalsy();
    expect(view.isMobileShell).toBe(false);
  });

  it('animates switching to tainted mode', () => {
    jest.useFakeTimers();

    view.setTainted(true);
    fixture.detectChanges();

    expect(store.isTainted()).toBe(true);
    expect(view.modeSlidePhase()).toBe('enter');
    expect(view.modeSlideDirection()).toBe('to-tainted');

    const body = fixture.nativeElement.querySelector('.checklist-body');
    expect(body.classList.contains('checklist-body--enter')).toBe(true);
    expect(body.classList.contains('checklist-body--to-tainted')).toBe(true);

    jest.advanceTimersByTime(340);
    fixture.detectChanges();

    expect(view.modeSlidePhase()).toBe('idle');
    expect(view.modeSlideDirection()).toBeNull();
  });

  it('animates switching back to regular mode', () => {
    jest.useFakeTimers();
    store.setTainted(true);
    fixture.detectChanges();

    view.setTainted(false);
    fixture.detectChanges();

    expect(store.isTainted()).toBe(false);
    expect(view.modeSlideDirection()).toBe('to-regular');

    const body = fixture.nativeElement.querySelector('.checklist-body');
    expect(body.classList.contains('checklist-body--to-regular')).toBe(true);

    jest.advanceTimersByTime(340);
    fixture.detectChanges();

    expect(view.modeSlidePhase()).toBe('idle');
  });

  it('ignores redundant tainted changes while animating', () => {
    jest.useFakeTimers();

    view.setTainted(true);
    view.setTainted(false);

    expect(store.isTainted()).toBe(true);
    expect(view.modeSlidePhase()).toBe('enter');
  });

  it('ignores selecting the mode that is already active', () => {
    expect(store.isTainted()).toBe(false);

    view.setTainted(false);

    expect(view.modeSlidePhase()).toBe('idle');
    expect(view.modeSlideDirection()).toBeNull();
  });

  it('switches mode instantly when reduced motion is preferred', () => {
    TestBed.inject(LayoutService).prefersReducedMotion.set(true);

    view.setTainted(true);

    expect(store.isTainted()).toBe(true);
    expect(view.modeSlidePhase()).toBe('idle');
    expect(view.modeSlideDirection()).toBeNull();
  });

  it('switches mode from segmented control buttons on mobile', () => {
    jest.useFakeTimers();
    TestBed.inject(LayoutService).isMobile.set(true);
    fixture.detectChanges();

    const taintedButton = fixture.nativeElement.querySelectorAll('app-checklist-header .segment')[1] as HTMLButtonElement;
    taintedButton.click();
    fixture.detectChanges();

    expect(store.isTainted()).toBe(true);

    const thumb = fixture.nativeElement.querySelector('app-checklist-header .segmented-control__thumb');
    expect(thumb.classList.contains('segmented-control__thumb--tainted')).toBe(true);
  });
});
