import {
  buildCharacterUnlockCells,
  buildEmptyCellIndices,
  buildImagePath,
  buildUnlockAriaLabel,
  countAchievedUnlocks,
  countCharacterUnlockProgress,
  extractSteamIds,
  formatAchievedPercent,
  formatBossList,
  getExtraCellCount,
  getRowSpan,
  getUnlockForCharacterIndex,
  getUnlockSourceAchievementIndex,
  mergeSteamIds,
  parseAchievementApiName,
  parseChallengeName,
  getChallengeDlc,
  getChallengeDlcBadgeIcon,
  getChallengeDlcFromNumber,
  getChallengeDlcLabel,
  toggleSteamId
} from './checklist.utils';

describe('checklist.utils', () => {
  const achievements = [
    {
      name: 'Heart',
      icon: { normal: 'Completion_Heart', hard: 'Completion_Heart_Hard' },
      boss: ["Mom's Heart"],
      unlocks: [
        { name: 'Lost Baby', steamId: 167, tier: null, icon: 'Lost_Baby' },
        { name: 'Cute Baby', steamId: 168, tier: null, icon: 'Cute_Baby' }
      ]
    }
  ] as const;

  it('builds image asset paths', () => {
    expect(buildImagePath('marks', 'Platinum_God')).toBe('/assets/icons/marks/Platinum_God.webp');
  });

  it('formats boss names on one line', () => {
    expect(formatBossList(["Mom's Heart", 'It Lives!'])).toBe("Mom's Heart · It Lives!");
  });

  it('parses numbered challenge names', () => {
    expect(parseChallengeName('1. Pitch Black')).toEqual({ number: '1', title: 'Pitch Black' });
    expect(parseChallengeName('45. DELETE THIS')).toEqual({ number: '45', title: 'DELETE THIS' });
    expect(parseChallengeName('Unnumbered')).toEqual({ number: '', title: 'Unnumbered' });
  });

  it('maps challenge numbers to dlc tiers', () => {
    expect(getChallengeDlcFromNumber(1)).toBe('rebirth');
    expect(getChallengeDlcFromNumber(20)).toBe('rebirth');
    expect(getChallengeDlcFromNumber(21)).toBe('afterbirth');
    expect(getChallengeDlcFromNumber(30)).toBe('afterbirth');
    expect(getChallengeDlcFromNumber(31)).toBe('afterbirth_plus');
    expect(getChallengeDlcFromNumber(35)).toBe('afterbirth_plus');
    expect(getChallengeDlcFromNumber(36)).toBe('repentance');
    expect(getChallengeDlcFromNumber(45)).toBe('repentance');
  });

  it('resolves dlc badge icons and labels from challenge names', () => {
    expect(getChallengeDlc('1. Pitch Black')).toBe('rebirth');
    expect(getChallengeDlcBadgeIcon('rebirth')).toBeNull();
    expect(getChallengeDlcBadgeIcon(getChallengeDlc('21. XXXXXXXXL'))).toBe('afterbirth');
    expect(getChallengeDlcBadgeIcon(getChallengeDlc('31. Backasswards'))).toBe('afterbirth_plus');
    expect(getChallengeDlcBadgeIcon(getChallengeDlc('36. Scat Man'))).toBe('repentance');
    expect(getChallengeDlcLabel('afterbirth_plus')).toBe('Afterbirth †');
  });

  it('describes unlock state in aria labels', () => {
    expect(buildUnlockAriaLabel('Lost Baby', false)).toBe('Lost Baby, not completed');
    expect(buildUnlockAriaLabel('Lost Baby', true)).toBe('Lost Baby, completed');
  });

  it('extracts steam ids from achievements', () => {
    expect(extractSteamIds(achievements)).toEqual([167, 168]);
  });

  it('counts achieved unlocks against valid steam ids only', () => {
    expect(countAchievedUnlocks(new Set([167, 999]), [167, 168])).toBe(1);
  });

  it.each([
    { achieved: 1, total: 4, expected: '25.0' },
    { achieved: 0, total: 0, expected: '0.0' }
  ])('formats achieved percent ($achieved/$total => $expected)', ({ achieved, total, expected }) => {
    expect(formatAchievedPercent(achieved, total)).toBe(expected);
  });

  it('toggles steam ids immutably', () => {
    expect([...toggleSteamId(new Set(), 167)]).toEqual([167]);
    expect([...toggleSteamId(new Set([167]), 167)]).toEqual([]);
  });

  it('merges steam ids without removing existing ones', () => {
    expect([...mergeSteamIds(new Set([167]), [168, 167, 0, -1, 1.5])].sort((a, b) => a - b)).toEqual([
      167, 168
    ]);
  });

  it.each([
    { apiName: '167', expected: 167 },
    { apiName: 'achievement_167', expected: 167 },
    { apiName: 'ACHIEVEMENT-168', expected: 168 },
    { apiName: '  169  ', expected: 169 },
    { apiName: 'not-an-id', expected: null },
    { apiName: '', expected: null }
  ])('parseAchievementApiName($apiName) => $expected', ({ apiName, expected }) => {
    expect(parseAchievementApiName(apiName)).toBe(expected);
  });

  it.each([
    { tainted: false, index: 1, expected: 1 },
    { tainted: true, index: 1, expected: 4 },
    { tainted: true, index: 6, expected: 2 },
    { tainted: true, index: 5, expected: 1 }
  ])('getRowSpan(tainted=$tainted, index=$index) => $expected', ({ tainted, index, expected }) => {
    expect(getRowSpan(index, tainted)).toBe(expected);
  });

  it.each([
    { tainted: false, index: 0, achievementsLength: 1, characterCount: 5, expected: 4 },
    { tainted: true, index: 0, achievementsLength: 1, characterCount: 5, expected: 4 },
    { tainted: true, index: 5, achievementsLength: 1, characterCount: 5, expected: 1 }
  ])(
    'getExtraCellCount(tainted=$tainted, index=$index) => $expected',
    ({ tainted, index, achievementsLength, characterCount, expected }) => {
      expect(getExtraCellCount(achievementsLength, index, tainted, characterCount)).toBe(expected);
    }
  );

  it('builds empty cell indices from count', () => {
    expect(buildEmptyCellIndices(3)).toEqual([0, 1, 2]);
  });

  it('resolves unlock source rows for tainted rowspan coverage', () => {
    expect(getUnlockSourceAchievementIndex(2, true)).toBe(1);
    expect(getUnlockSourceAchievementIndex(5, true)).toBe(5);
  });

  it('builds character unlock cells with trailing empty slots', () => {
    expect(buildCharacterUnlockCells(achievements[0], 0, false, 4)).toEqual([
      achievements[0].unlocks[0],
      achievements[0].unlocks[1],
      null,
      null
    ]);
  });

  it('returns unlocks by character index', () => {
    expect(getUnlockForCharacterIndex(achievements, 0, 0, false, 4)).toEqual(
      achievements[0].unlocks[0]
    );
    expect(getUnlockForCharacterIndex(achievements, 0, 3, false, 4)).toBeNull();
  });

  it('counts unlock progress for a character column', () => {
    expect(countCharacterUnlockProgress(achievements, 0, false, 4, new Set([167]))).toEqual({
      achieved: 1,
      total: 1
    });
    expect(countCharacterUnlockProgress(achievements, 1, false, 4, new Set())).toEqual({
      achieved: 0,
      total: 1
    });
    expect(countCharacterUnlockProgress(achievements, 3, false, 4, new Set())).toEqual({
      achieved: 0,
      total: 0
    });
  });
});
