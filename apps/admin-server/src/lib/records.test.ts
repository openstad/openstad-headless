import { describe, expect, it } from 'vitest';

import { getRecords } from './records';

describe('getRecords', () => {
  it('returns an empty list for missing data', () => {
    expect(getRecords(undefined)).toEqual([]);
    expect(getRecords(null)).toEqual([]);
  });

  it('returns plain arrays as-is', () => {
    const list = [{ id: 1 }];
    expect(getRecords(list)).toBe(list);
  });

  it('unwraps paginated responses', () => {
    const records = [{ id: 1 }];
    const metadata = { page: 0, pageSize: 20, pageCount: 1, totalCount: 1 };
    expect(getRecords({ metadata, records })).toBe(records);
  });
});
