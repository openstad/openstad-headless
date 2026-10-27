import { isPlainObject, looseFormEqual } from './loose-equal';

const has = (list: unknown[], item: unknown) =>
  list.some((entry) => looseFormEqual(entry, item));

/** The stored values with the edits made before they arrived on top. */
export function mergeEarlyEdits(
  base: unknown,
  ours: unknown,
  theirs: unknown
): unknown {
  if (looseFormEqual(ours, base)) return theirs;
  if (
    Array.isArray(ours) &&
    (base == null || Array.isArray(base)) &&
    (theirs == null || Array.isArray(theirs))
  ) {
    const before = (base as unknown[] | undefined) ?? [];
    const stored = (theirs as unknown[] | undefined) ?? [];
    const removed = before.filter((item) => !has(ours, item));
    const added = ours.filter((item) => !has(before, item));
    const kept = stored.filter((item) => !has(removed, item));
    return [...kept, ...added.filter((item) => !has(kept, item))];
  }
  if (
    isPlainObject(ours) &&
    (base == null || isPlainObject(base)) &&
    (theirs == null || isPlainObject(theirs))
  ) {
    const before = (base ?? {}) as Record<string, unknown>;
    const stored = (theirs ?? {}) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    const keys = new Set([
      ...Object.keys(stored),
      ...Object.keys(ours),
      ...Object.keys(before),
    ]);
    keys.forEach((key) => {
      const value = mergeEarlyEdits(before[key], ours[key], stored[key]);
      if (value !== undefined) out[key] = value;
    });
    return out;
  }
  return ours;
}
