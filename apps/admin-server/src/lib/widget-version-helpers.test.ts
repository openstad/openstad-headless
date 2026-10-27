import { describe, expect, it } from 'vitest';

import {
  IdEntity,
  formatDate,
  idsFromValue,
  resolveIds,
  stripSystemFields,
  summarizeChanges,
  versionLabel,
} from './widget-version-helpers';

const localIso = new Date(2026, 9, 13, 9, 5, 7).toISOString();

function emptyMaps(): Record<IdEntity, Map<string, string>> {
  return {
    tag: new Map(),
    status: new Map(),
    resource: new Map(),
    choiceguide: new Map(),
    area: new Map(),
  };
}

describe('formatDate', () => {
  it('formats a date as a Dutch date and time with seconds', () => {
    expect(formatDate(localIso)).toBe('13-10-2026, 09:05:07');
  });
});

describe('versionLabel', () => {
  it('uses the version name when set', () => {
    expect(versionLabel({ name: 'Voor livegang', createdAt: localIso })).toBe(
      'Voor livegang'
    );
  });

  it('falls back to the formatted creation date without a name', () => {
    expect(versionLabel({ name: null, createdAt: localIso })).toBe(
      '13-10-2026, 09:05:07'
    );
  });
});

describe('idsFromValue', () => {
  it('turns an array into string ids and drops empty entries', () => {
    expect(idsFromValue([1, '2', ''])).toEqual(['1', '2']);
  });

  it('wraps a single number', () => {
    expect(idsFromValue(7)).toEqual(['7']);
  });

  it('splits a comma separated string and trims it', () => {
    expect(idsFromValue('3, 4,,5 ')).toEqual(['3', '4', '5']);
  });

  it('returns no ids for other values', () => {
    expect(idsFromValue(undefined)).toEqual([]);
    expect(idsFromValue(null)).toEqual([]);
    expect(idsFromValue({ id: 1 })).toEqual([]);
  });
});

describe('resolveIds', () => {
  it('replaces known id fields with sorted names', () => {
    const maps = emptyMaps();
    maps.tag.set('1', 'Verkeer');
    maps.tag.set('2', 'Groen');

    expect(resolveIds({ onlyIncludeTagIds: '1,2' }, maps)).toEqual({
      onlyIncludeTagIds: 'Groen, Verkeer',
    });
  });

  it('shows unknown ids with a hash prefix', () => {
    expect(resolveIds({ onlyIncludeStatusIds: [9] }, emptyMaps())).toEqual({
      onlyIncludeStatusIds: '#9',
    });
  });

  it('resolves id fields in nested objects and arrays', () => {
    const maps = emptyMaps();
    maps.resource.set('5', 'Speeltuin');

    expect(
      resolveIds({ items: [{ resourceId: 5, title: 'Vraag' }] }, maps)
    ).toEqual({ items: [{ resourceId: 'Speeltuin', title: 'Vraag' }] });
  });

  it('keeps an id field untouched when it holds no ids', () => {
    expect(resolveIds({ areaId: '' }, emptyMaps())).toEqual({ areaId: '' });
  });

  it('leaves non id fields and primitives alone', () => {
    expect(resolveIds({ title: 'Kaart', count: 3 }, emptyMaps())).toEqual({
      title: 'Kaart',
      count: 3,
    });
    expect(resolveIds('tekst', emptyMaps())).toBe('tekst');
  });
});

describe('stripSystemFields', () => {
  it('drops system fields and the top level id', () => {
    expect(
      stripSystemFields(
        {
          id: 1,
          uuid: 'abc',
          widgetId: 2,
          projectId: 3,
          datalayer: {},
          title: 'Kaart',
        },
        true
      )
    ).toEqual({ title: 'Kaart' });
  });

  it('drops the id of nested items that have a stable key', () => {
    expect(
      stripSystemFields({ items: [{ id: 'x1', fieldKey: 'naam' }] }, true)
    ).toEqual({ items: [{ fieldKey: 'naam' }] });
  });

  it('keeps the id of nested objects without a stable key', () => {
    expect(stripSystemFields({ resource: { id: 4 } }, true)).toEqual({
      resource: { id: 4 },
    });
  });

  it('keeps trigger and key values', () => {
    expect(stripSystemFields({ items: [{ trigger: '1', key: 'a' }] })).toEqual({
      items: [{ trigger: '1', key: 'a' }],
    });
  });
});

describe('summarizeChanges', () => {
  it('returns null when nothing visible changed', () => {
    expect(
      summarizeChanges(
        { title: 'Kaart', uuid: 'a' },
        { title: 'Kaart', uuid: 'b' }
      )
    ).toBeNull();
  });

  it('lists the labels of changed fields', () => {
    expect(
      summarizeChanges(
        { title: 'Oud', description: 'Zelfde' },
        { title: 'Nieuw', description: 'Zelfde' }
      )
    ).toBe('Titel');
  });

  it('counts added and removed fields as changes', () => {
    expect(summarizeChanges({ title: 'Kaart' }, { placeholder: 'Zoek' })).toBe(
      'Titel, Placeholder'
    );
  });

  it('ignores changes in item ids that only differ by system fields', () => {
    expect(
      summarizeChanges(
        { items: [{ id: 'a', fieldKey: 'naam' }] },
        { items: [{ id: 'b', fieldKey: 'naam' }] }
      )
    ).toBeNull();
  });

  it('truncates after four labels', () => {
    expect(
      summarizeChanges(
        {},
        { title: 1, description: 2, summary: 3, name: 4, label: 5, color: 6 }
      )
    ).toBe('Titel, Beschrijving, Samenvatting, Naam +2 meer');
  });

  it('handles a missing previous config', () => {
    expect(summarizeChanges(null, { title: 'Kaart' })).toBe('Titel');
  });
});
