import { ChecklistMode } from '../models/checklist.model';

export const UNLOCKS_STORAGE_KEY = 'unlockedSteamIds' as const;

export const STEAM_CONNECTED_STORAGE_KEY = 'steamConnected' as const;

export const TUTORIAL_SEEN_KEY = 'tutorialSeen' as const;

export const CHECKLIST_MODES: readonly ChecklistMode[] = ['regular', 'tainted', 'challenges'];

export const TAINTED_FULL_ROW_INDICES: readonly number[] = [0, 8, 13];

export const TAINTED_ROW_SPANS: Readonly<Record<number, number>> = {
  1: 4,
  6: 2
};

export const ICON_BASE_PATH = '/assets/icons' as const;

export const MOBILE_BREAKPOINT = '(max-width: 768px)' as const;

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)' as const;

export const SLIDE_TRANSITION_MS = 340 as const;

export const ROW_PULSE_MS = 400 as const;

export const STEAM_TOAST_MS = 4000 as const;
