import {
  buildCharacterUnlockCells,
  buildEmptyCellIndices,
  buildImagePath,
  buildUnlockAriaLabel,
  countAchievedUnlocks,
  countCharacterUnlockProgress,
  extractUnlockNames,
  formatAchievedPercent,
  formatBossList,
  getExtraCellCount,
  getRowSpan,
  getUnlockForCharacterIndex,
  getUnlockSourceAchievementIndex,
  toggleUnlockName
} from './checklist.utils';

describe('checklist.utils', () => {
  const achievements = [
    {
      name: 'Heart',
      icon: { normal: 'Completion_Heart', hard: 'Completion_Heart_Hard' },
      boss: ["Mom's Heart"],
      unlocks: [
        { name: 'Lost Baby', tier: null, icon: 'Lost_Baby' },
        { name: 'Cute Baby', tier: null, icon: 'Cute_Baby' }
      ]
    }
  ] as const;

  it('builds image asset paths', () => {
    expect(buildImagePath('marks', 'Platinum_God')).toBe('/assets/icons/marks/Platinum_God.webp');
  });

  it('formats boss names on one line', () => {
    expect(formatBossList(["Mom's Heart", 'It Lives!'])).toBe("Mom's Heart · It Lives!");
  });

  it('describes unlock state in aria labels', () => {
    expect(buildUnlockAriaLabel('Lost Baby', false)).toBe('Lost Baby, not completed');
    expect(buildUnlockAriaLabel('Lost Baby', true)).toBe('Lost Baby, completed');
  });

  it('extracts unlock names from achievements', () => {
    expect(extractUnlockNames(achievements)).toEqual(['Lost Baby', 'Cute Baby']);
  });

  it('counts achieved unlocks against valid names only', () => {
    expect(countAchievedUnlocks(['Lost Baby', 'Invalid'], ['Lost Baby', 'Cute Baby'])).toBe(1);
  });

  it.each([
    { achieved: 1, total: 4, expected: '25.0' },
    { achieved: 0, total: 0, expected: '0.0' }
  ])('formats achieved percent ($achieved/$total => $expected)', ({ achieved, total, expected }) => {
    expect(formatAchievedPercent(achieved, total)).toBe(expected);
  });

  it('toggles unlock names immutably', () => {
    expect(toggleUnlockName([], 'Lost Baby')).toEqual(['Lost Baby']);
    expect(toggleUnlockName(['Lost Baby'], 'Lost Baby')).toEqual([]);
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
    expect(
      buildCharacterUnlockCells(achievements[0], 0, false, 4)
    ).toEqual([
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
    expect(countCharacterUnlockProgress(achievements, 0, false, 4, ['Lost Baby'])).toEqual({
      achieved: 1,
      total: 1
    });
    expect(countCharacterUnlockProgress(achievements, 1, false, 4, [])).toEqual({
      achieved: 0,
      total: 1
    });
    expect(countCharacterUnlockProgress(achievements, 3, false, 4, [])).toEqual({
      achieved: 0,
      total: 0
    });
  });
});
