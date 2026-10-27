import { describe, expect, it } from 'vitest';

import { mergeEarlyEdits } from './merge-early-edits';

describe('mergeEarlyEdits', () => {
  it('takes the stored value for a field that was not touched', () => {
    expect(mergeEarlyEdits('', '', 'Opgeslagen')).toBe('Opgeslagen');
    expect(mergeEarlyEdits(undefined, undefined, ['Url'])).toEqual(['Url']);
  });

  it('keeps a text the user typed before the stored values arrived', () => {
    expect(mergeEarlyEdits('', 'Getypt', 'Opgeslagen')).toBe('Getypt');
  });

  it('adds a ticked item to the stored list instead of replacing it', () => {
    expect(
      mergeEarlyEdits(undefined, ['Local'], ['UniqueCode', 'Url'])
    ).toEqual(['UniqueCode', 'Url', 'Local']);
    expect(mergeEarlyEdits([], ['Local'], ['UniqueCode', 'Url'])).toEqual([
      'UniqueCode',
      'Url',
      'Local',
    ]);
  });

  it('removes an item the user unticked from the stored list', () => {
    expect(mergeEarlyEdits(['Url'], [], ['UniqueCode', 'Url'])).toEqual([
      'UniqueCode',
    ]);
  });

  it('does not add an item twice', () => {
    expect(mergeEarlyEdits([], ['Url'], ['UniqueCode', 'Url'])).toEqual([
      'UniqueCode',
      'Url',
    ]);
  });

  it('adds rows of objects to the stored rows', () => {
    expect(
      mergeEarlyEdits(
        [],
        [{ url: 'nieuw.nl' }],
        [{ url: 'a.nl' }, { url: 'b.nl' }]
      )
    ).toEqual([{ url: 'a.nl' }, { url: 'b.nl' }, { url: 'nieuw.nl' }]);
  });

  it('merges nested objects field by field', () => {
    expect(
      mergeEarlyEdits(
        { title: '', labels: [] },
        { title: 'Getypt', labels: [] },
        { title: 'Opgeslagen', labels: ['Naam'], info: 'Tekst' }
      )
    ).toEqual({ title: 'Getypt', labels: ['Naam'], info: 'Tekst' });
  });

  it('treats dates as values', () => {
    const before = new Date('2026-01-01T00:00:00Z');
    const stored = new Date('2027-07-27T22:00:00Z');
    expect(mergeEarlyEdits(before, new Date(before), stored)).toBe(stored);
    const picked = new Date('2028-01-01T00:00:00Z');
    expect(mergeEarlyEdits(before, picked, stored)).toBe(picked);
  });

  it('does not count a field that only gained empty values as an edit', () => {
    expect(
      mergeEarlyEdits(
        [{ url: 'a.png' }],
        [{ url: 'a.png', description: undefined }],
        [{ url: 'a.png' }, { url: 'b.png' }]
      )
    ).toEqual([{ url: 'a.png' }, { url: 'b.png' }]);
    expect(mergeEarlyEdits(undefined, '', 'Opgeslagen')).toBe('Opgeslagen');
  });

  it('fills fields a form built with empty defaults has not touched', () => {
    expect(
      mergeEarlyEdits(
        {},
        { name: undefined, icon: [] },
        { name: 'Laag', layer: '{}', icon: [] }
      )
    ).toEqual({ name: 'Laag', layer: '{}', icon: [] });
  });
});
