import { ComponentFixture, TestBed } from '@angular/core/testing';

import checklistData from '../checklist-data.json';
import { ChecklistMobileComponent } from './checklist-mobile.component';
import { ChecklistStore } from '../services/checklist.store';
import { LayoutService } from '../services/layout.service';

describe('ChecklistMobileComponent', () => {
  let fixture: ComponentFixture<ChecklistMobileComponent>;
  let store: ChecklistStore;
  let view: ChecklistMobileComponent & {
    getUnlockForCharacter(achievementIndex: number): { name: string } | null;
    selectPreviousCharacter(): void;
    selectNextCharacter(): void;
    openPicker(): void;
    closePicker(): void;
    selectCharacter(characterIndex: number): void;
    canSelectPrevious(): boolean;
    canSelectNext(): boolean;
    pickerOpen(): boolean;
    slideDirection(): 'next' | 'prev' | null;
    slidePhase(): 'idle' | 'enter';
    pulseRowName(): string | null;
    toggleUnlock(unlock: { name: string }): void;
    formatBossList(bosses: readonly string[]): string;
    buildUnlockAriaLabel(unlockName: string, isUnlocked: boolean): string;
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChecklistMobileComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistMobileComponent);
    store = TestBed.inject(ChecklistStore);
    store.initialize();
    view = fixture.componentInstance as typeof view;
    fixture.detectChanges();

    const list = fixture.nativeElement.querySelector('.achievement-list') as HTMLElement;
    list.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it('returns the unlock for the selected character column', () => {
    const expectedUnlock = checklistData.achievements[0].unlocks[0];

    expect(view.getUnlockForCharacter(0)).toEqual(expectedUnlock);
  });

  it('updates unlock lookup when the selected character changes', () => {
    store.setSelectedCharacter(1);
    fixture.detectChanges();
    const expectedUnlock = checklistData.achievements[0].unlocks[1];

    expect(view.getUnlockForCharacter(0)).toEqual(expectedUnlock);
  });

  it('renders character navigator and horizontal achievement rows', () => {
    expect(fixture.nativeElement.querySelector('.character-nav__name').textContent).toContain('Isaac');
    expect(fixture.nativeElement.querySelectorAll('button.achievement-row').length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.achievement-row__marks')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.achievement-row__unlock-icon')).toBeTruthy();
  });

  it('toggles unlock when the achievement row is clicked', () => {
    const unlock = checklistData.achievements[0].unlocks[0];
    const row = fixture.nativeElement.querySelector('button.achievement-row') as HTMLButtonElement;

    expect(store.isUnlocked(unlock.name)).toBe(false);

    row.click();
    expect(store.isUnlocked(unlock.name)).toBe(true);

    row.click();
    expect(store.isUnlocked(unlock.name)).toBe(false);
  });

  it('pulses the row briefly when toggling an unlock', () => {
    jest.useFakeTimers();
    const unlock = checklistData.achievements[0].unlocks[0];

    view.toggleUnlock(unlock);
    expect(view.pulseRowName()).toBe(unlock.name);

    jest.advanceTimersByTime(400);
    expect(view.pulseRowName()).toBeNull();
  });

  it('animates character changes with the same timing as the picker sheet', () => {
    jest.useFakeTimers();

    view.selectNextCharacter();
    expect(store.selectedCharacterIndex()).toBe(1);
    expect(view.slidePhase()).toBe('enter');
    expect(view.slideDirection()).toBe('next');

    jest.advanceTimersByTime(340);
    expect(view.slidePhase()).toBe('idle');
    expect(view.slideDirection()).toBeNull();
  });

  it('ignores rapid character changes while the slide animation is running', () => {
    jest.useFakeTimers();

    view.selectNextCharacter();
    view.selectNextCharacter();
    expect(store.selectedCharacterIndex()).toBe(1);

    jest.advanceTimersByTime(340);
  });

  it('ignores external character changes during the slide animation', () => {
    jest.useFakeTimers();
    const expectedUnlock = checklistData.achievements[0].unlocks[1];

    view.selectNextCharacter();
    store.setSelectedCharacter(5);
    fixture.detectChanges();

    expect(view.getUnlockForCharacter(0)).toEqual(expectedUnlock);

    jest.advanceTimersByTime(340);
  });

  it('does not animate when selecting the same character from the picker', () => {
    view.openPicker();
    const currentIndex = store.selectedCharacterIndex();
    view.selectCharacter(currentIndex);

    expect(store.selectedCharacterIndex()).toBe(currentIndex);
    expect(view.slideDirection()).toBeNull();
  });

  it('resets pulse timers when toggling quickly', () => {
    jest.useFakeTimers();
    const unlock = checklistData.achievements[0].unlocks[0];

    view.toggleUnlock(unlock);
    view.toggleUnlock(unlock);
    jest.advanceTimersByTime(400);
    expect(view.pulseRowName()).toBeNull();
  });

  it('slides backward when picking an earlier character', () => {
    jest.useFakeTimers();
    store.setSelectedCharacter(2);
    fixture.detectChanges();

    view.selectCharacter(0);

    jest.advanceTimersByTime(340);
    expect(store.selectedCharacterIndex()).toBe(0);
    expect(view.slideDirection()).toBeNull();
  });

  it('describes unlock state in the row aria label', () => {
    const unlock = checklistData.achievements[0].unlocks[0];

    expect(view.buildUnlockAriaLabel(unlock.name, false)).toBe(`${unlock.name}, not completed`);

    store.toggleUnlock(unlock.name);
    expect(view.buildUnlockAriaLabel(unlock.name, true)).toBe(`${unlock.name}, completed`);
  });

  it('navigates characters with previous and next controls', () => {
    jest.useFakeTimers();

    expect(view.canSelectPrevious()).toBe(false);
    expect(view.canSelectNext()).toBe(true);

    view.selectNextCharacter();
    jest.advanceTimersByTime(340);
    expect(store.selectedCharacterIndex()).toBe(1);

    jest.advanceTimersByTime(340);

    view.selectPreviousCharacter();
    jest.advanceTimersByTime(340);
    expect(store.selectedCharacterIndex()).toBe(0);
  });

  it('opens and closes the character picker sheet', () => {
    const dialog = fixture.nativeElement.querySelector('dialog.character-sheet') as HTMLDialogElement;

    expect(view.pickerOpen()).toBe(false);
    expect(dialog.hasAttribute('open')).toBe(false);

    view.openPicker();
    fixture.detectChanges();
    expect(view.pickerOpen()).toBe(true);
    expect(dialog.hasAttribute('open')).toBe(true);

    view.closePicker();
    fixture.detectChanges();
    expect(view.pickerOpen()).toBe(false);
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('selects a character from the picker and closes the sheet', () => {
    jest.useFakeTimers();
    view.openPicker();
    view.selectCharacter(2);

    jest.advanceTimersByTime(340);
    expect(store.selectedCharacterIndex()).toBe(2);
  });

  it('does not move past the first or last character', () => {
    store.setSelectedCharacter(0);
    view.selectPreviousCharacter();
    expect(store.selectedCharacterIndex()).toBe(0);

    store.setSelectedCharacter(store.characters().length - 1);
    view.selectNextCharacter();
    expect(store.selectedCharacterIndex()).toBe(store.characters().length - 1);
  });

  it('closes the picker when Escape is pressed', () => {
    const dialog = fixture.nativeElement.querySelector('dialog.character-sheet') as HTMLDialogElement;

    view.openPicker();
    fixture.detectChanges();
    dialog.dispatchEvent(new Event('close'));
    fixture.detectChanges();

    expect(view.pickerOpen()).toBe(false);
  });

  it('closes the picker when the backdrop is clicked', () => {
    view.openPicker();
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.character-sheet__backdrop') as HTMLButtonElement;
    backdrop.click();
    fixture.detectChanges();

    expect(view.pickerOpen()).toBe(false);
  });

  it('ignores close when the picker is already closed', () => {
    view.closePicker();

    expect(view.pickerOpen()).toBe(false);
  });

  it('changes character instantly when reduced motion is preferred', () => {
    TestBed.inject(LayoutService).prefersReducedMotion.set(true);

    view.selectNextCharacter();

    expect(store.selectedCharacterIndex()).toBe(1);
    expect(view.slidePhase()).toBe('idle');
  });

  it('formats boss names on one line', () => {
    expect(view.formatBossList(["Mom's Heart", 'It Lives!'])).toBe("Mom's Heart · It Lives!");
  });
});
