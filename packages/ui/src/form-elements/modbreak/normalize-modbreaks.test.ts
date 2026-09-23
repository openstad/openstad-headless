import { describe, expect, test } from 'vitest';

import {
  normalizeModBreakDate,
  normalizeModBreaks,
  sortModBreaksDescending,
} from './normalize-modbreaks';

describe('normalizeModBreakDate', () => {
  test('ISO string with milliseconds and Z is sliced to 16 chars', () => {
    expect(normalizeModBreakDate('2026-09-22T14:30:00.000Z')).toBe(
      '2026-09-22T14:30'
    );
  });

  test('ISO string with seconds (no Z) is sliced to 16 chars', () => {
    expect(normalizeModBreakDate('2026-09-22T14:30:00')).toBe(
      '2026-09-22T14:30'
    );
  });

  test('date-only string gets T00:00 appended', () => {
    expect(normalizeModBreakDate('2026-09-22')).toBe('2026-09-22T00:00');
  });

  test('already-normalized value passes through unchanged', () => {
    expect(normalizeModBreakDate('2026-09-22T14:30')).toBe('2026-09-22T14:30');
  });

  test('empty string returns empty string', () => {
    expect(normalizeModBreakDate('')).toBe('');
  });

  test('undefined/null return empty string', () => {
    expect(normalizeModBreakDate(undefined)).toBe('');
    expect(normalizeModBreakDate(null)).toBe('');
  });

  test('invalid string returns empty string', () => {
    expect(normalizeModBreakDate('not-a-date')).toBe('');
  });
});

describe('sortModBreaksDescending', () => {
  test('sorts newest first', () => {
    const items = [
      { modBreakDate: '2026-01-01T00:00' },
      { modBreakDate: '2026-09-22T14:30' },
      { modBreakDate: '2026-05-15T09:00' },
    ];
    expect(sortModBreaksDescending(items).map((i) => i.modBreakDate)).toEqual([
      '2026-09-22T14:30',
      '2026-05-15T09:00',
      '2026-01-01T00:00',
    ]);
  });

  test('does not mutate the input array', () => {
    const items = [
      { modBreakDate: '2026-01-01T00:00' },
      { modBreakDate: '2026-09-22T14:30' },
    ];
    const original = [...items];
    sortModBreaksDescending(items);
    expect(items).toEqual(original);
  });
});

describe('normalizeModBreaks', () => {
  test('normalizes every date and sorts descending in one pass', () => {
    const items = [
      { id: '1', description: '', modBreakDate: '2026-01-01' },
      { id: '2', description: '', modBreakDate: '2026-09-22T14:30:00.000Z' },
    ];
    const result = normalizeModBreaks(items);
    expect(result.map((i) => i.modBreakDate)).toEqual([
      '2026-09-22T14:30',
      '2026-01-01T00:00',
    ]);
  });

  test('preserves createdAt on existing items (only modBreakDate is touched)', () => {
    const items = [
      {
        id: '1',
        description: 'x',
        modBreakDate: '2026-09-22T14:30:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    const result = normalizeModBreaks(items);
    expect(result[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
