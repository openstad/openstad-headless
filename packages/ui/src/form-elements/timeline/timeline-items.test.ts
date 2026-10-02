import { describe, expect, it } from 'vitest';

import { getCustomTitle, getItemLabel, normalizeItems } from './timeline-items';

type TestItem = {
  trigger: string;
  activeFrom: string;
  title: string;
  activeTo?: string;
};

const item = (trigger: string, activeFrom: string, title = ''): TestItem => ({
  trigger,
  activeFrom,
  title,
});

describe('normalizeItems', () => {
  it('sorts by start date and renumbers the triggers', () => {
    const normalized = normalizeItems([
      item('0', '2026-10-01', 'Later'),
      item('0', '2026-09-01', 'Earlier'),
    ]);
    expect(normalized.map((i) => i.title)).toEqual(['Earlier', 'Later']);
    expect(normalized.map((i) => i.trigger)).toEqual(['0', '1']);
  });

  it('keeps the insertion order for items on the same date', () => {
    const normalized = normalizeItems([
      item('0', '2026-09-01', 'First'),
      item('1', '2026-09-01', 'Second'),
      item('2', '2026-08-01', 'Before'),
    ]);
    expect(normalized.map((i) => i.title)).toEqual([
      'Before',
      'First',
      'Second',
    ]);
  });

  it('computes end dates from the next item', () => {
    const normalized = normalizeItems([
      item('0', '2026-10-01', 'Later'),
      item('1', '2026-09-01', 'Earlier'),
    ]);
    expect(normalized[0].activeTo).toBe('2026-09-30');
    expect(normalized[1].activeTo).toBeUndefined();
  });
});

describe('getCustomTitle', () => {
  it('returns the trimmed title', () => {
    expect(getCustomTitle({ title: '  Publicatie ' })).toBe('Publicatie');
  });

  it('treats a stored date or a missing title as no title', () => {
    expect(getCustomTitle({ title: '2026-10-03' })).toBe('');
    expect(getCustomTitle({})).toBe('');
  });
});

describe('getItemLabel', () => {
  it('combines date and title', () => {
    expect(
      getItemLabel({ activeFrom: '2026-09-28', title: 'Publicatie' })
    ).toBe('28 september 2026 – Publicatie');
  });

  it('shows only the date when there is no custom title', () => {
    expect(
      getItemLabel({ activeFrom: '2026-10-03', title: '2026-10-03' })
    ).toBe('3 oktober 2026');
    expect(getItemLabel({ activeFrom: '2026-10-03' })).toBe('3 oktober 2026');
  });
});
