import cloneDeep from 'lodash/cloneDeep';

export function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

export function withId(item: any) {
  return item.id ? item : { ...item, id: generateId() };
}

export type SeededItems<T> = { items: T[]; generatedIds: Set<string> };

/**
 * Adopt a saved list for local editing in a widget "Items" tab.
 *
 * Every item gets an id so the editors can address it, and every item is an
 * isolated deep copy: `previewConfig` is a shallow copy of the SWR-cached
 * `widget.config` (useWidgetPreview.tsx), so the item objects are shared, and
 * some editors mutate items in place while reordering. Without the copy those
 * mutations silently rewrite the saved baseline the dirty check compares to.
 *
 * Ids generated here are editor-only. `stripGeneratedIds` keeps them out of the
 * draft, so opening a tab can never rename a stored item.
 */
export function seedItems<T extends { id?: string }>(
  items: T[] | undefined | null
): SeededItems<T> {
  const generatedIds = new Set<string>();
  const seeded = cloneDeep(items ?? []).map((item) => {
    if (item.id) return item;
    const seededItem = withId(item) as T & { id: string };
    generatedIds.add(seededItem.id);
    return seededItem as T;
  });
  return { items: seeded, generatedIds };
}

/**
 * Remove editor-only ids before a list goes into the draft. Stored ids and ids
 * the admin created through "add item" are left untouched.
 */
export function stripGeneratedIds<T extends { id?: string }>(
  items: T[],
  generatedIds: Set<string>
): T[] {
  if (generatedIds.size === 0) return items;
  return items.map((item) => {
    if (!item.id || !generatedIds.has(item.id)) return item;
    const { id: _id, ...rest } = item;
    return rest as T;
  });
}

/** Resolve a React-style updater against the list it was meant to build on. */
export function resolveItemsUpdate<T>(
  currentItems: T[],
  updater: T[] | ((currentItems: T[]) => T[])
): T[] {
  return typeof updater === 'function'
    ? (updater as (currentItems: T[]) => T[])(currentItems)
    : updater;
}
