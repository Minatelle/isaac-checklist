import {
  ICON_BASE_PATH,
  TAINTED_FULL_ROW_INDICES,
  TAINTED_ROW_SPANS
} from '../constants/checklist.constants';
import { Achievement, Unlock } from '../models/checklist.model';

export function buildImagePath(folder: string, icon: string): string {
  return `${ICON_BASE_PATH}/${folder}/${icon}.webp`;
}

export function formatBossList(bosses: readonly string[]): string {
  return bosses.join(' · ');
}

export function buildUnlockAriaLabel(unlockName: string, isUnlocked: boolean): string {
  const state = isUnlocked ? 'completed' : 'not completed';
  return `${unlockName}, ${state}`;
}

export function extractSteamIds(achievements: readonly Achievement[]): number[] {
  return achievements.flatMap(achievement =>
    achievement.unlocks
      .map(unlock => unlock.steamId)
      .filter((steamId): steamId is number => steamId != null)
  );
}

export function countAchievedUnlocks(
  unlocked: ReadonlySet<number>,
  validSteamIds: readonly number[]
): number {
  const valid = new Set(validSteamIds);
  let achieved = 0;

  for (const steamId of unlocked) {
    if (valid.has(steamId)) {
      achieved++;
    }
  }

  return achieved;
}

export function formatAchievedPercent(achieved: number, total: number): string {
  if (total === 0) {
    return '0.0';
  }

  return ((achieved / total) * 100).toFixed(1);
}

export function toggleSteamId(unlocked: ReadonlySet<number>, steamId: number): Set<number> {
  const next = new Set(unlocked);

  if (next.has(steamId)) {
    next.delete(steamId);
  } else {
    next.add(steamId);
  }

  return next;
}

export function mergeSteamIds(
  unlocked: ReadonlySet<number>,
  steamIds: Iterable<number>
): Set<number> {
  const next = new Set(unlocked);

  for (const steamId of steamIds) {
    if (Number.isInteger(steamId) && steamId > 0) {
      next.add(steamId);
    }
  }

  return next;
}

export function parseAchievementApiName(apiName: string): number | null {
  const trimmed = apiName.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const prefixed = /^achievement[_\s-]?(\d+)$/i.exec(trimmed);
  return prefixed?.[1] != null ? Number(prefixed[1]) : null;
}

export function getRowSpan(achievementIndex: number, isTainted: boolean): number {
  if (!isTainted) {
    return 1;
  }

  return TAINTED_ROW_SPANS[achievementIndex] ?? 1;
}

export function getExtraCellCount(
  achievementsLength: number,
  achievementIndex: number,
  isTainted: boolean,
  characterCount: number
): number {
  if (isTainted && !TAINTED_FULL_ROW_INDICES.includes(achievementIndex)) {
    return 1;
  }

  return characterCount - achievementsLength;
}

export function buildEmptyCellIndices(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

export function getUnlockSourceAchievementIndex(
  achievementIndex: number,
  isTainted: boolean
): number {
  if (!isTainted) {
    return achievementIndex;
  }

  for (let row = 0; row < achievementIndex; row++) {
    const span = getRowSpan(row, true);
    if (span > 1 && row + span > achievementIndex) {
      return row;
    }
  }

  return achievementIndex;
}

export function buildCharacterUnlockCells(
  achievement: Achievement,
  achievementIndex: number,
  isTainted: boolean,
  characterCount: number
): (Unlock | null)[] {
  const emptyCellCount = getExtraCellCount(
    achievement.unlocks.length,
    achievementIndex,
    isTainted,
    characterCount
  );

  return [...achievement.unlocks, ...new Array<null>(emptyCellCount).fill(null)];
}

export function getUnlockForCharacterIndex(
  achievements: readonly Achievement[],
  achievementIndex: number,
  characterIndex: number,
  isTainted: boolean,
  characterCount: number
): Unlock | null {
  const sourceIndex = getUnlockSourceAchievementIndex(achievementIndex, isTainted);
  const sourceAchievement = achievements[sourceIndex];
  const cells = buildCharacterUnlockCells(
    sourceAchievement,
    sourceIndex,
    isTainted,
    characterCount
  );

  return cells[characterIndex] ?? null;
}

export function countCharacterUnlockProgress(
  achievements: readonly Achievement[],
  characterIndex: number,
  isTainted: boolean,
  characterCount: number,
  unlocked: ReadonlySet<number>
): { achieved: number; total: number } {
  let achieved = 0;
  let total = 0;

  for (let achievementIndex = 0; achievementIndex < achievements.length; achievementIndex++) {
    const unlock = getUnlockForCharacterIndex(
      achievements,
      achievementIndex,
      characterIndex,
      isTainted,
      characterCount
    );

    if (unlock?.steamId == null) {
      continue;
    }

    total++;

    if (unlocked.has(unlock.steamId)) {
      achieved++;
    }
  }

  return { achieved, total };
}
