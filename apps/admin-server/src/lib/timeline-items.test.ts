import { describe, expect, it } from 'vitest';

import {
  cleanLinks,
  getCustomTitle,
  moveEntry,
  normalizeTimelineItems,
} from './timeline-items';

type TestItem = {
  trigger: string;
  title: string;
  activeFrom?: string;
  activeTo?: string;
};

const item = (
  trigger: string,
  activeFrom: string,
  title: string
): TestItem => ({
  trigger,
  activeFrom,
  title,
});

describe('normalizeTimelineItems', () => {
  it('sorts by start date and renumbers the triggers', () => {
    const normalized = normalizeTimelineItems([
      item('0', '2026-10-01', 'Later'),
      item('1', '2026-09-28', 'Middle'),
      item('2', '2026-09-01', 'Earlier'),
    ]);
    expect(normalized.map((i) => i.title)).toEqual([
      'Earlier',
      'Middle',
      'Later',
    ]);
    expect(normalized.map((i) => i.trigger)).toEqual(['0', '1', '2']);
  });

  it('keeps the insertion order for items on the same date', () => {
    const normalized = normalizeTimelineItems([
      item('0', '2026-09-01', 'First'),
      item('1', '2026-09-01', 'Second'),
    ]);
    expect(normalized.map((i) => i.title)).toEqual(['First', 'Second']);
  });

  it('recomputes the end dates from the next item', () => {
    const normalized = normalizeTimelineItems([
      item('0', '2026-10-01', 'Later'),
      item('1', '2026-09-01', 'Earlier'),
    ]);
    expect(normalized[0].activeTo).toBe('2026-09-30');
    expect(normalized[1].activeTo).toBeUndefined();
  });
});

describe('getCustomTitle', () => {
  it('returns the trimmed title', () => {
    expect(getCustomTitle('  Publicatie ')).toBe('Publicatie');
  });

  it('treats a stored date or a missing title as no title', () => {
    expect(getCustomTitle('2026-10-03')).toBe('');
    expect(getCustomTitle(undefined)).toBe('');
  });
});

describe('cleanLinks', () => {
  it('drops empty links and renumbers the rest', () => {
    const links = cleanLinks([
      { trigger: '4', title: 'Handleiding', url: '/doc.pdf' },
      { trigger: '5', title: ' ', url: '' },
      { trigger: '9', title: '', url: 'https://example.org' },
    ]);
    expect(links.map((l) => [l.trigger, l.url])).toEqual([
      ['0', '/doc.pdf'],
      ['1', 'https://example.org'],
    ]);
  });
});

describe('moveEntry', () => {
  it('moves an entry up or down', () => {
    expect(moveEntry(['a', 'b', 'c'], 2, 'up')).toEqual(['a', 'c', 'b']);
    expect(moveEntry(['a', 'b', 'c'], 0, 'down')).toEqual(['b', 'a', 'c']);
  });

  it('returns the same array at the edges', () => {
    const entries = ['a', 'b'];
    expect(moveEntry(entries, 0, 'up')).toBe(entries);
    expect(moveEntry(entries, 1, 'down')).toBe(entries);
  });
});
