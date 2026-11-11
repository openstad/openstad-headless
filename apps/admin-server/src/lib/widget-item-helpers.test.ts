import { describe, expect, it } from 'vitest';

import {
  generateId,
  resolveItemsUpdate,
  seedItems,
  stripGeneratedIds,
  withId,
} from './widget-item-helpers';

describe('generateId', () => {
  it('returns a non-empty base36 string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(id).toMatch(/^[0-9a-z]+$/);
  });

  it('produces distinct values across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    // Collisions are possible but should be vanishingly rare at this sample size.
    expect(ids.size).toBeGreaterThan(990);
  });
});

describe('withId', () => {
  it('keeps an existing id untouched', () => {
    const item = { id: 'abc', label: 'Item' };
    expect(withId(item)).toBe(item);
  });

  it('adds a generated id when none is present', () => {
    const item = { label: 'Item' };
    const result = withId(item);
    expect(result).not.toBe(item);
    expect(result.label).toBe('Item');
    expect(typeof result.id).toBe('string');
    expect(result.id.length).toBeGreaterThan(0);
  });

  it('treats a falsy id (empty string, 0) as missing', () => {
    expect(withId({ id: '' }).id).not.toBe('');
    expect(withId({ id: 0 }).id).not.toBe(0);
  });
});

describe('seedItems', () => {
  it('returns an empty list for undefined and null', () => {
    expect(seedItems(undefined).items).toEqual([]);
    expect(seedItems(null).items).toEqual([]);
    expect(seedItems(undefined).generatedIds.size).toBe(0);
  });

  it('keeps an existing id and reports no generated id', () => {
    const input = [{ id: 'stored-1', title: 'Vraag' }];
    const { items, generatedIds } = seedItems(input);

    expect(items[0].id).toBe('stored-1');
    expect(generatedIds.size).toBe(0);
  });

  it('returns isolated copies so an editor mutation cannot rewrite the saved baseline', () => {
    const input = [
      { id: 'stored-1', title: 'Vraag', options: [{ title: 'A' }] },
    ];
    const { items } = seedItems(input);

    expect(items[0]).not.toBe(input[0]);
    expect(items[0]).toEqual(input[0]);

    // previewConfig.items shares its objects with widget.config.items, and some
    // editors mutate items in place while reordering.
    (items[0] as any).title = 'Gewijzigd';
    (items[0] as any).options[0].title = 'B';
    expect(input[0].title).toBe('Vraag');
    expect(input[0].options[0].title).toBe('A');
  });

  it('adds an id to a legacy item and records it as generated', () => {
    const input: { id?: string; title: string }[] = [{ title: 'Legacy' }];
    const { items, generatedIds } = seedItems(input);

    expect(typeof items[0].id).toBe('string');
    expect(generatedIds.has(items[0].id as string)).toBe(true);
  });

  it('does not mutate the input array or its items', () => {
    const input: { id?: string; title: string }[] = [{ title: 'Legacy' }];
    seedItems(input);

    expect(input).toEqual([{ title: 'Legacy' }]);
  });
});

describe('stripGeneratedIds', () => {
  it('removes only the ids that were generated during seeding', () => {
    const items = [
      { id: 'stored-1', title: 'Opgeslagen' },
      { id: 'seeded-1', title: 'Legacy' },
      { id: 'editor-1', title: 'Nieuw' },
    ];

    const result = stripGeneratedIds(items, new Set(['seeded-1']));

    expect(result.map((item) => item.id)).toEqual([
      'stored-1',
      undefined,
      'editor-1',
    ]);
    expect(result[1]).not.toHaveProperty('id');
  });

  it('returns the same list when nothing was generated', () => {
    const items = [{ id: 'stored-1' }];
    expect(stripGeneratedIds(items, new Set())).toBe(items);
  });

  it('leaves items without an id alone', () => {
    const items: { id?: string; title: string }[] = [{ title: 'Geen id' }];
    expect(stripGeneratedIds(items, new Set(['seeded-1']))).toEqual(items);
  });
});

describe('resolveItemsUpdate', () => {
  it('applies a function updater to the list it is given', () => {
    const result = resolveItemsUpdate([{ id: 'a' }], (current) => [
      ...current,
      { id: 'b' },
    ]);
    expect(result.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('passes a plain array through unchanged', () => {
    const next = [{ id: 'b' }];
    expect(resolveItemsUpdate([{ id: 'a' }], next)).toBe(next);
  });
});
