import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistComponent } from './checklist.component';
import { ChecklistStore } from './services/checklist.store';

describe('ChecklistComponent', () => {
  let component: ChecklistComponent;
  let fixture: ComponentFixture<ChecklistComponent>;
  let store: ChecklistStore;
  let view: ChecklistComponent & {
    getImagePath(folder: string, icon: string): string;
    getRowSpan(index: number): number;
    getEmptyCellIndices(achievementsLength: number, achievementIndex: number): number[];
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChecklistComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(ChecklistStore);
    view = component as typeof view;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes the checklist store on init', () => {
    expect(store.totalUnlocks()).toBeGreaterThan(0);
  });

  it('builds image asset paths', () => {
    expect(view.getImagePath('marks', 'Platinum_God')).toBe('/assets/icons/marks/Platinum_God.png');
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
