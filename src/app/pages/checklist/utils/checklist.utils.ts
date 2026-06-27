import {
  ICON_BASE_PATH,
  TAINTED_FULL_ROW_INDICES,
  TAINTED_ROW_SPANS
} from '../constants/checklist.constants';
import { Achievement } from '../models/checklist.model';

export function buildImagePath(folder: string, icon: string): string {
  return `${ICON_BASE_PATH}/${folder}/${icon}.png`;
}

export function extractUnlockNames(achievements: readonly Achievement[]): string[] {
  return achievements.flatMap(achievement => achievement.unlocks.map(unlock => unlock.name));
}

export function countAchievedUnlocks(
  unlocked: readonly string[],
  validNames: readonly string[]
): number {
  const valid = new Set(validNames);
  return unlocked.filter(name => valid.has(name)).length;
}

export function formatAchievedPercent(achieved: number, total: number): string {
  if (total === 0) {
    return '0.0';
  }

  return ((achieved / total) * 100).toFixed(1);
}

export function toggleUnlockName(list: readonly string[], name: string): string[] {
  return list.includes(name) ? list.filter(item => item !== name) : [...list, name];
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
