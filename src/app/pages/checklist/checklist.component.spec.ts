import { ComponentFixture, TestBed } from '@angular/core/testing';

import checklistData from './checklist-data.json';
import checklistTaintedData from './checklist-tainted-data.json';
import { ChecklistComponent } from './checklist.component';

describe('ChecklistComponent', () => {
  let component: ChecklistComponent;
  let fixture: ComponentFixture<ChecklistComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [ChecklistComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with regular checklist data', () => {
    expect(component.isTainted()).toBe(false);
    expect(component.characters()[0].name).toBe(checklistData.characters[0].name);
    expect(component.achievements()[0].name).toBe(checklistData.achievements[0].name);
  });

  it('restores unlocked achievements from localStorage on init', () => {
    const achievementName = checklistData.achievements[0].unlocks[0].name;
    localStorage.setItem('unlockedAchievements', JSON.stringify([achievementName]));

    component.ngOnInit();

    expect(component.isUnlocked(achievementName)).toBe(true);
    expect(component.achievedUnlocks()).toBe(1);
  });

  it('switches between regular and tainted datasets', () => {
    expect(component.characters()[0].name).toBe('Isaac');

    component.setTainted(true);
    expect(component.isTainted()).toBe(true);
    expect(component.characters()[0].name).toBe(checklistTaintedData.characters[0].name);

    component.setTainted(false);
    expect(component.isTainted()).toBe(false);
    expect(component.characters()[0].name).toBe(checklistData.characters[0].name);
  });

  it('toggles achievement unlock state and persists to localStorage', () => {
    const achievementName = component.achievements()[0].unlocks[0].name;

    expect(component.isUnlocked(achievementName)).toBe(false);

    component.lockUnlock(achievementName);
    expect(component.isUnlocked(achievementName)).toBe(true);
    expect(localStorage.getItem('unlockedAchievements')).toContain(achievementName);

    component.lockUnlock(achievementName);
    expect(component.isUnlocked(achievementName)).toBe(false);
  });

  it('computes achievement metrics', () => {
    const achievementName = component.achievements()[0].unlocks[0].name;
    const total = component.totalUnlocks();

    expect(component.achievedUnlocks()).toBe(0);
    expect(total).toBeGreaterThan(0);
    expect(component.achievedPercent()).toBe('0.0');

    component.lockUnlock(achievementName);
    expect(component.achievedUnlocks()).toBe(1);
    expect(component.achievedPercent()).toBe(((1 / total) * 100).toFixed(1));

    component.achievements.set([]);
    expect(component.totalUnlocks()).toBe(0);
    expect(component.achievedPercent()).toBe('0.0');
  });

  it('builds image asset paths', () => {
    expect(component.getImagePath('marks', 'Platinum_God')).toBe('/assets/icons/marks/Platinum_God.png');
  });

  it.each([
    { tainted: false, index: 1, expected: 1 },
    { tainted: true, index: 1, expected: 4 },
    { tainted: true, index: 6, expected: 2 },
    { tainted: true, index: 5, expected: 1 }
  ])('getRowSpan(tainted=$tainted, index=$index) => $expected', ({ tainted, index, expected }) => {
    component.setTainted(tainted);
    expect(component.getRowSpan(index)).toBe(expected);
  });

  it.each([
    { tainted: false, index: 0, achievementsLength: 1 },
    { tainted: true, index: 0, achievementsLength: 1 },
    { tainted: true, index: 5, achievementsLength: 1 }
  ])(
    'getEmptyCellIndices(tainted=$tainted, index=$index) returns expected count',
    ({ tainted, index, achievementsLength }) => {
      component.setTainted(tainted);
      const expected =
        tainted && ![0, 8, 13].includes(index)
          ? 1
          : component.characters().length - achievementsLength;
      expect(component.getEmptyCellIndices(achievementsLength, index)).toHaveLength(expected);
    }
  );
});
