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

  it('restores unlocked steam ids from storage on initialize', () => {
    const unlock = checklistData.achievements[0].unlocks[0];
    localStorage.setItem('unlockedSteamIds', JSON.stringify([unlock.steamId]));

    store.initialize();

    expect(store.isUnlocked(unlock)).toBe(true);
    expect(store.achievedUnlocks()).toBe(1);
  });

  it('switches between regular and tainted datasets', () => {
    store.initialize();

    expect(store.characters()[0].name).toBe('Isaac');

    store.setTainted(true);
    expect(store.isTainted()).toBe(true);
    expect(store.selectedCharacterIndex()).toBe(0);
    expect(store.characters()[0].name).toBe(checklistTaintedData.characters[0].name);

    store.setTainted(false);
    expect(store.characters()[0].name).toBe(checklistData.characters[0].name);
  });

  it('updates the selected character index', () => {
    store.initialize();

    store.setSelectedCharacter(2);
    expect(store.selectedCharacterIndex()).toBe(2);
  });

  it('toggles achievement unlock state and persists to storage', () => {
    store.initialize();
    const unlock = store.achievements()[0].unlocks[0];

    expect(store.isUnlocked(unlock)).toBe(false);

    store.toggleUnlock(unlock);
    expect(store.isUnlocked(unlock)).toBe(true);
    expect(JSON.parse(localStorage.getItem('unlockedSteamIds')!)).toEqual([unlock.steamId]);

    store.toggleUnlock(unlock);
    expect(store.isUnlocked(unlock)).toBe(false);
  });

  it('ignores unlocks without a steam id', () => {
    store.initialize();
    const unlock = { name: 'Missing', steamId: undefined, tier: null, icon: null };

    expect(store.isUnlocked(unlock)).toBe(false);
    store.toggleUnlock(unlock);
    expect(store.unlockedSteamIds().size).toBe(0);
    expect(localStorage.getItem('unlockedSteamIds')).toBeNull();
  });

  it('computes achievement metrics', () => {
    store.initialize();
    const unlock = store.achievements()[0].unlocks[0];
    const total = store.totalUnlocks();

    expect(store.achievedUnlocks()).toBe(0);
    expect(total).toBeGreaterThan(0);
    expect(store.achievedPercent()).toBe('0.0');

    store.toggleUnlock(unlock);
    expect(store.achievedUnlocks()).toBe(1);
    expect(store.achievedPercent()).toBe(((1 / total) * 100).toFixed(1));
  });

  it('imports steam unlocks as a union and persists them', () => {
    store.initialize();
    const first = checklistData.achievements[0].unlocks[0].steamId!;
    const second = checklistData.achievements[0].unlocks[1].steamId!;

    store.toggleUnlock(store.achievements()[0].unlocks[0]);

    const added = store.importSteamUnlocks([first, second, second, 0]);
    expect(added).toBe(1);
    expect(store.unlockedSteamIds().has(first)).toBe(true);
    expect(store.unlockedSteamIds().has(second)).toBe(true);
    expect(JSON.parse(localStorage.getItem('unlockedSteamIds')!)).toEqual([first, second]);
  });
});
