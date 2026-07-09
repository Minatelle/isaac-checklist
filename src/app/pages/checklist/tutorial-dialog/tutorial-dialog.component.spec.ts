import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialDialogComponent } from './tutorial-dialog.component';
import { LayoutService } from '../services/layout.service';
import { TutorialStorageService } from '../services/tutorial-storage.service';

describe('TutorialDialogComponent', () => {
  let fixture: ComponentFixture<TutorialDialogComponent>;
  let component: TutorialDialogComponent;
  let tutorialStorage: TutorialStorageService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TutorialDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialDialogComponent);
    component = fixture.componentInstance;
    tutorialStorage = TestBed.inject(TutorialStorageService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('opens the dialog with showModal', () => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const showModal = jest.spyOn(dialog, 'showModal');

    component.open();

    expect(showModal).toHaveBeenCalled();
  });

  it('does nothing when close is called while dialog is already closed', () => {
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const closeSpy = jest.spyOn(dialog, 'close');

    component.close();

    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('marks tutorial as seen and emits closed when dialog closes', () => {
    const closed = jest.fn();
    component.closed.subscribe(closed);

    component.open();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.close();

    expect(tutorialStorage.hasSeen()).toBe(true);
    expect(closed).toHaveBeenCalled();
  });

  it('closes from the Got it button', () => {
    component.open();
    fixture.detectChanges();

    const confirmButton = fixture.nativeElement.querySelector('.tutorial-dialog__confirm') as HTMLButtonElement;
    confirmButton.click();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);
    expect(tutorialStorage.hasSeen()).toBe(true);
  });

  it('shows mobile-specific content on mobile layout', () => {
    TestBed.inject(LayoutService).isMobile.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('On mobile');
    expect(fixture.nativeElement.textContent).not.toContain('On desktop');
  });

  it('shows desktop-specific content on desktop layout', () => {
    TestBed.inject(LayoutService).isMobile.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('On desktop');
    expect(fixture.nativeElement.textContent).not.toContain('On mobile');
  });
});
