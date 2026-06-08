/**
 * Pure, timezone-free helpers for timeline item date ranges.
 *
 * All dates are YYYY-MM-DD strings. Arithmetic is done via Date.UTC so that
 * daylight-saving transitions never shift the result — the same approach used
 * in packages/ui/src/form-elements/timeline/format-date.ts.
 */

/** Subtract one calendar day from a YYYY-MM-DD string and return the result. */
export function subtractOneDay(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  const utcMs = Date.UTC(year, month - 1, day - 1);
  const d = new Date(utcMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

type DateRangeItem = {
  activeFrom?: string;
  activeTo?: string;
};

/**
 * Derive each item's end date from the next item's start date.
 *
 * Rule (applied after sorting chronologically by activeFrom):
 * - Item has a later neighbour with a different activeFrom → activeTo is set to
 *   subtractOneDay(nextStart).
 * - Last item (or next item has the same activeFrom) → left open-ended.
 *
 * End dates are always recomputed from the start dates, so deleting, inserting,
 * or moving an item never leaves a stale activeTo behind. Returns a new array;
 * the originals are not mutated.
 */
export function fillTimelineEndDates<T extends DateRangeItem>(items: T[]): T[] {
  if (!items || items.length === 0) return items;

  const sorted = [...items].sort((a, b) => {
    const af = a.activeFrom ?? '';
    const bf = b.activeFrom ?? '';
    if (af < bf) return -1;
    if (af > bf) return 1;
    return 0;
  });

  return sorted.map((item, index) => {
    const next = sorted[index + 1];
    const nextStart = next?.activeFrom ?? '';
    const currentStart = item.activeFrom ?? '';

    // No later item, or a sibling starting the same day → open-ended.
    if (!nextStart || nextStart === currentStart) {
      const { activeTo, ...rest } = item;
      return rest as T;
    }

    return { ...item, activeTo: subtractOneDay(nextStart) };
  });
}
