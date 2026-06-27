import { ComponentFixture, TestBed } from '@angular/core/testing';

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with regular characters', () => {
    expect(component.isTainted()).toBe(false);
  });

  it('should switch to tainted characters', () => {
    component.setTainted(true);
    expect(component.isTainted()).toBe(true);
  });

  it('should toggle achievement unlock state', () => {
    const achievementName = component.achievements()[0].unlocks[0].name;

    expect(component.isUnlocked(achievementName)).toBe(false);

    component.lockUnlock(achievementName);
    expect(component.isUnlocked(achievementName)).toBe(true);
    expect(localStorage.getItem('unlockedAchievements')).toContain(achievementName);

    component.lockUnlock(achievementName);
    expect(component.isUnlocked(achievementName)).toBe(false);
  });

  it('should restore unlocked achievements from localStorage', () => {
    const achievementName = component.achievements()[0].unlocks[0].name;
    localStorage.setItem('unlockedAchievements', JSON.stringify([achievementName]));

    component.ngOnInit();

    expect(component.isUnlocked(achievementName)).toBe(true);
    expect(component.achievedUnlocks()).toBeGreaterThan(0);
  });
});
