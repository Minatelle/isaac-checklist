import {
  ICON_BASE_PATH,
  MOBILE_BREAKPOINT,
  STEAM_CONNECTED_STORAGE_KEY,
  STEAM_TOAST_MS,
  TAINTED_FULL_ROW_INDICES,
  TAINTED_ROW_SPANS,
  UNLOCKS_STORAGE_KEY
} from './checklist.constants';

describe('checklist.constants', () => {
  it('defines the storage key', () => {
    expect(UNLOCKS_STORAGE_KEY).toBe('unlockedSteamIds');
  });

  it('defines the steam connected storage key', () => {
    expect(STEAM_CONNECTED_STORAGE_KEY).toBe('steamConnected');
  });

  it('defines the steam toast duration', () => {
    expect(STEAM_TOAST_MS).toBe(4000);
  });

  it('defines tainted row layout values', () => {
    expect(TAINTED_FULL_ROW_INDICES).toEqual([0, 8, 13]);
    expect(TAINTED_ROW_SPANS).toEqual({ 1: 4, 6: 2 });
  });

  it('defines the icon base path', () => {
    expect(ICON_BASE_PATH).toBe('/assets/icons');
  });

  it('defines the mobile breakpoint', () => {
    expect(MOBILE_BREAKPOINT).toBe('(max-width: 768px)');
  });
});
