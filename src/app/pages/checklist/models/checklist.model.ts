export interface Character {
  name: string;
  icon: string | null;
}

export interface Unlock {
  name: string;
  tier: number | null;
  icon: string | null;
}

export interface AchievementIcon {
  normal: string;
  hard?: string | null;
}

export interface Achievement {
  name: string;
  icon: AchievementIcon;
  boss: string[];
  unlocks: Unlock[];
}

export interface ChecklistData {
  characters: Character[];
  achievements: Achievement[];
}
