import { describe, expect, it } from 'vitest';

import {
  fillTimelineEndDates,
  formatDutchDate,
  getTimelineItemStatus,
  subtractOneDay,
  toDateKey,
} from './timeline-dates';

describe('formatDutchDate', () => {
  it('formats a date-only string as a Dutch long date', () => {
    expect(formatDutchDate('2026-09-28')).toBe('28 september 2026');
  });

  it('returns the input when it is not a date', () => {
    expect(formatDutchDate('medio 2027')).toBe('medio 2027');
  });
});

describe('subtractOneDay', () => {
  it('crosses month and year boundaries', () => {
    expect(subtractOneDay('2026-10-01')).toBe('2026-09-30');
    expect(subtractOneDay('2027-01-01')).toBe('2026-12-31');
  });

  it('returns an empty string for invalid input', () => {
    expect(subtractOneDay('not-a-date')).toBe('');
  });
});

describe('toDateKey', () => {
  it('keeps date-only strings and trims whitespace', () => {
    expect(toDateKey(' 2026-09-28 ')).toBe('2026-09-28');
  });

  it('reduces full timestamps to their UTC date', () => {
    expect(toDateKey('2026-09-28T10:15:00.000Z')).toBe('2026-09-28');
  });

  it('returns null for empty or invalid values', () => {
    expect(toDateKey('')).toBeNull();
    expect(toDateKey(undefined)).toBeNull();
    expect(toDateKey('not-a-date')).toBeNull();
  });
});

describe('getTimelineItemStatus', () => {
  const today = '2026-09-30';

  it('marks an item whose range has ended as passed but not current', () => {
    expect(
      getTimelineItemStatus(
        { activeFrom: '2026-09-26', activeTo: '2026-09-26' },
        today
      )
    ).toEqual({ passed: true, current: false });
  });

  it('marks the item whose range contains today as passed and current', () => {
    expect(
      getTimelineItemStatus(
        { activeFrom: '2026-09-28', activeTo: '2026-09-30' },
        today
      )
    ).toEqual({ passed: true, current: true });
  });

  it('treats the start date itself as reached', () => {
    expect(getTimelineItemStatus({ activeFrom: today }, today)).toEqual({
      passed: true,
      current: true,
    });
  });

  it('leaves a future item neither passed nor current', () => {
    expect(getTimelineItemStatus({ activeFrom: '2026-10-01' }, today)).toEqual({
      passed: false,
      current: false,
    });
  });

  it('counts an item without a start date as started', () => {
    expect(getTimelineItemStatus({}, today)).toEqual({
      passed: true,
      current: true,
    });
    expect(getTimelineItemStatus({ activeTo: '2026-09-01' }, today)).toEqual({
      passed: true,
      current: false,
    });
  });

  it('keeps every reached item passed across a filled timeline', () => {
    const items = fillTimelineEndDates([
      { activeFrom: '2026-09-26' },
      { activeFrom: '2026-09-27' },
      { activeFrom: '2026-09-28' },
      { activeFrom: '2026-10-01' },
    ]);
    const statuses = items.map((item) => getTimelineItemStatus(item, today));
    expect(statuses.map((s) => s.passed)).toEqual([true, true, true, false]);
    expect(statuses.map((s) => s.current)).toEqual([false, false, true, false]);
  });
});
