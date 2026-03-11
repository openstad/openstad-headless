import { describe, expect, it } from 'vitest';

import {
  type StatsData,
  getCount,
  getStatByKey,
  getTimeSeries,
} from './stats-helpers';

const mockStats: StatsData = [
  {
    key: 'resourceTotal',
    description: 'Amount of resources',
    result: [{ counted: 42 }],
  },
  {
    key: 'resourceVotesCountTotal',
    description: 'Amount of votes on resources',
    result: [{ counted: 150 }],
  },
  {
    key: 'resourcesSubmittedPerDay',
    description: 'Resources submitted per day',
    result: [
      { date: '2023-11-20', counted: 3 },
      { date: '2023-11-21', counted: 7 },
      { date: '2023-11-22', counted: 1 },
    ],
  },
];

describe('getStatByKey', () => {
  it('returns the stat item for a valid key', () => {
    const result = getStatByKey(mockStats, 'resourceTotal');
    expect(result).toBeDefined();
    expect(result?.key).toBe('resourceTotal');
  });

  it('returns undefined for a missing key', () => {
    const result = getStatByKey(mockStats, 'nonExistentKey');
    expect(result).toBeUndefined();
  });
});

describe('getCount', () => {
  it('returns the correct count for a valid key', () => {
    expect(getCount(mockStats, 'resourceTotal')).toBe(42);
  });

  it('returns the correct count for another valid key', () => {
    expect(getCount(mockStats, 'resourceVotesCountTotal')).toBe(150);
  });

  it('returns 0 for a missing key', () => {
    expect(getCount(mockStats, 'nonExistentKey')).toBe(0);
  });

  it('returns 0 for a time-series key', () => {
    expect(getCount(mockStats, 'resourcesSubmittedPerDay')).toBe(0);
  });

  it('returns 0 for empty stats', () => {
    expect(getCount([], 'resourceTotal')).toBe(0);
  });

  it('returns 0 when result array is empty', () => {
    const stats: StatsData = [
      { key: 'empty', description: 'Empty', result: [] },
    ];
    expect(getCount(stats, 'empty')).toBe(0);
  });
});

describe('getTimeSeries', () => {
  it('returns the date array for a valid time-series key', () => {
    const result = getTimeSeries(mockStats, 'resourcesSubmittedPerDay');
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ date: '2023-11-20', counted: 3 });
    expect(result[2]).toEqual({ date: '2023-11-22', counted: 1 });
  });

  it('returns empty array for a missing key', () => {
    expect(getTimeSeries(mockStats, 'nonExistentKey')).toEqual([]);
  });

  it('returns empty array for a count-type key', () => {
    expect(getTimeSeries(mockStats, 'resourceTotal')).toEqual([]);
  });

  it('returns empty array for empty stats', () => {
    expect(getTimeSeries([], 'resourcesSubmittedPerDay')).toEqual([]);
  });
});
