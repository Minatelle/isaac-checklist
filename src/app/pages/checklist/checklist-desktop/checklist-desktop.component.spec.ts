import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistDesktopComponent } from './checklist-desktop.component';
import { ChecklistStore } from '../services/checklist.store';

describe('ChecklistDesktopComponent', () => {
  let fixture: ComponentFixture<ChecklistDesktopComponent>;
  let store: ChecklistStore;
  let view: ChecklistDesktopComponent & {
    getRowSpan(index: number): number;
    getEmptyCellIndices(achievementsLength: number, achievementIndex: number): number[];
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChecklistDesktopComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistDesktopComponent);
    store = TestBed.inject(ChecklistStore);
    store.initialize();
    view = fixture.componentInstance as typeof view;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it.each([
    { tainted: false, index: 1, expected: 1 },
    { tainted: true, index: 1, expected: 4 },
    { tainted: true, index: 6, expected: 2 },
    { tainted: true, index: 5, expected: 1 }
  ])('getRowSpan(tainted=$tainted, index=$index) => $expected', ({ tainted, index, expected }) => {
    store.setTainted(tainted);
    expect(view.getRowSpan(index)).toBe(expected);
  });

  it.each([
    { tainted: false, index: 0, achievementsLength: 1 },
    { tainted: true, index: 0, achievementsLength: 1 },
    { tainted: true, index: 5, achievementsLength: 1 }
  ])(
    'getEmptyCellIndices(tainted=$tainted, index=$index) returns expected count',
    ({ tainted, index, achievementsLength }) => {
      store.setTainted(tainted);
      const expected =
        tainted && ![0, 8, 13].includes(index)
          ? 1
          : store.characters().length - achievementsLength;
      expect(view.getEmptyCellIndices(achievementsLength, index)).toHaveLength(expected);
    }
  );

  it('renders a challenge card grid instead of the wiki table', () => {
    store.setMode('challenges');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.challenges-grid')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.wiki-table')).toBeFalsy();
    expect(fixture.nativeElement.querySelectorAll('.challenge-card').length).toBe(45);
    expect(fixture.nativeElement.querySelector('.challenge-card__title')?.textContent).toContain(
      'Pitch Black'
    );
  });

  it('shows quality tiers on challenge collectibles', () => {
    store.setMode('challenges');
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll(
      '.challenge-card'
    ) as NodeListOf<HTMLButtonElement>;

    // 14. It's in the Cards -> SMB Super Fan (tier 3)
    expect(cards[13].querySelector('.challenge-card__tier')?.getAttribute('alt')).toBe(
      'Quality tier 3'
    );
    // 19. The Family Man -> Epic Fetus (tier 4)
    expect(cards[18].querySelector('.challenge-card__tier')?.getAttribute('alt')).toBe(
      'Quality tier 4'
    );
    // 1. Pitch Black -> rune (no tier)
    expect(cards[0].querySelector('.challenge-card__tier')).toBeFalsy();
  });

  it('shows dlc badges for afterbirth and later challenges', () => {
    store.setMode('challenges');
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll(
      '.challenge-card'
    ) as NodeListOf<HTMLButtonElement>;

    expect(cards[0].querySelector('.challenge-card__dlc')).toBeFalsy();
    expect(cards[20].querySelector('.challenge-card__dlc')?.getAttribute('alt')).toBe('Afterbirth');
    expect(cards[30].querySelector('.challenge-card__dlc')?.getAttribute('alt')).toBe('Afterbirth †');
    expect(cards[35].querySelector('.challenge-card__dlc')?.getAttribute('alt')).toBe('Repentance');
  });

  it('toggles a challenge unlock from a card click', () => {
    store.setMode('challenges');
    fixture.detectChanges();

    const unlock = store.achievements()[0].unlocks[0];
    const card = fixture.nativeElement.querySelector('.challenge-card') as HTMLButtonElement;

    expect(store.isUnlocked(unlock)).toBe(false);
    card.click();
    fixture.detectChanges();
    expect(store.isUnlocked(unlock)).toBe(true);
    expect(card.classList.contains('unlocked')).toBe(true);
  });
});
