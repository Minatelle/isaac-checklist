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
});
