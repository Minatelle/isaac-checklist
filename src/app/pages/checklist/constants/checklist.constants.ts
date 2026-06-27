export const UNLOCKS_STORAGE_KEY = 'unlockedAchievements' as const;

export const TAINTED_FULL_ROW_INDICES: readonly number[] = [0, 8, 13];

export const TAINTED_ROW_SPANS: Readonly<Record<number, number>> = {
  1: 4,
  6: 2
};

export const ICON_BASE_PATH = '/assets/icons' as const;
