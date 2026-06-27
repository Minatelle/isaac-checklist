import { TestBed } from '@angular/core/testing';

import checklistData from '../checklist-data.json';
import checklistTaintedData from '../checklist-tainted-data.json';
import { ChecklistStore } from './checklist.store';

describe('ChecklistStore', () => {
  let store: ChecklistStore;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});
    store = TestBed.inject(ChecklistStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with regular checklist data', () => {
    store.initialize();

    expect(store.isTainted()).toBe(false);
    expect(store.characters()[0].name).toBe(checklistData.characters[0].name);
    expect(store.achievements()[0].name).toBe(checklistData.achievements[0].name);
  });

  it('restores unlocked achievements from storage on initialize', () => {
    const achievementName = checklistData.achievements[0].unlocks[0].name;
    localStorage.setItem('unlockedAchievements', JSON.stringify([achievementName]));

    store.initialize();

    expect(store.isUnlocked(achievementName)).toBe(true);
    expect(store.achievedUnlocks()).toBe(1);
  });

  it('switches between regular and tainted datasets', () => {
    store.initialize();

    expect(store.characters()[0].name).toBe('Isaac');

    store.setTainted(true);
    expect(store.isTainted()).toBe(true);
    expect(store.characters()[0].name).toBe(checklistTaintedData.characters[0].name);

    store.setTainted(false);
    expect(store.characters()[0].name).toBe(checklistData.characters[0].name);
  });

  it('toggles achievement unlock state and persists to storage', () => {
    store.initialize();
    const achievementName = store.achievements()[0].unlocks[0].name;

    expect(store.isUnlocked(achievementName)).toBe(false);

    store.toggleUnlock(achievementName);
    expect(store.isUnlocked(achievementName)).toBe(true);
    expect(localStorage.getItem('unlockedAchievements')).toContain(achievementName);

    store.toggleUnlock(achievementName);
    expect(store.isUnlocked(achievementName)).toBe(false);
  });

  it('computes achievement metrics', () => {
    store.initialize();
    const achievementName = store.achievements()[0].unlocks[0].name;
    const total = store.totalUnlocks();

    expect(store.achievedUnlocks()).toBe(0);
    expect(total).toBeGreaterThan(0);
    expect(store.achievedPercent()).toBe('0.0');

    store.toggleUnlock(achievementName);
    expect(store.achievedUnlocks()).toBe(1);
    expect(store.achievedPercent()).toBe(((1 / total) * 100).toFixed(1));
  });
});
