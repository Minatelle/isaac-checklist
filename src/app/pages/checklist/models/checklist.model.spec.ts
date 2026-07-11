import { Achievement, Character, ChecklistData, Unlock } from './checklist.model';

describe('checklist.model', () => {
  it('accepts representative checklist shapes', () => {
    const character: Character = { name: 'Isaac', icon: 'Character_Isaac' };
    const unlock: Unlock = { name: 'Lost Baby', steamId: 167, tier: null, icon: 'Lost_Baby' };
    const achievement: Achievement = {
      name: 'Heart',
      icon: { normal: 'Completion_Heart', hard: 'Completion_Heart_Hard' },
      boss: ["Mom's Heart"],
      unlocks: [unlock]
    };
    const data: ChecklistData = {
      characters: [character],
      achievements: [achievement]
    };

    expect(data.characters[0].name).toBe('Isaac');
    expect(data.achievements[0].unlocks[0].name).toBe('Lost Baby');
  });
});
