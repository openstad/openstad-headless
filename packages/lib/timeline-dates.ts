export const DUTCH_MONTHS = [
  'januari',
  'februari',
  'maart',
  'april',
  'mei',
  'juni',
  'juli',
  'augustus',
  'september',
  'oktober',
  'november',
  'december',
];

/** Format a YYYY-MM-DD string as a Dutch long date ("17 juni 2026"). */
export function formatDutchDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} ${DUTCH_MONTHS[month - 1]} ${year}`;
}

/** Subtract one day from a YYYY-MM-DD string; returns '' for invalid input. */
export function subtractOneDay(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return '';
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
 * Set each item's activeTo to the day before the next item's activeFrom.
 * The last item keeps its own (manually entered) end date, which may be empty
 * for an open-ended final phase.
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

    // Last item: keep its manually entered end date (may be open-ended).
    if (!next) {
      return item;
    }

    const nextStart = next.activeFrom ?? '';
    const currentStart = item.activeFrom ?? '';

    // Two items share a start date: no valid range to derive, leave end open.
    if (!nextStart || nextStart === currentStart) {
      const { activeTo, ...rest } = item;
      return rest as T;
    }

    return { ...item, activeTo: subtractOneDay(nextStart) };
  });
}

/**
 * Normalize a date value to a YYYY-MM-DD key. Accepts date-only strings as-is
 * and falls back to parsing full date strings. Returns null when the value is
 * empty or not a valid date.
 */
export function toDateKey(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export type TimelineItemStatus = {
  /** The start date has been reached; stays true after the item has ended. */
  passed: boolean;
  /** Today falls within the item's range (the current phase). */
  current: boolean;
};

/**
 * Determine whether an item has been reached and whether it is the current
 * phase, given today's date as a YYYY-MM-DD key. An item without a start date
 * counts as started.
 */
export function getTimelineItemStatus(
  item: DateRangeItem,
  todayKey: string
): TimelineItemStatus {
  const fromKey = toDateKey(item.activeFrom);
  const toKey = toDateKey(item.activeTo);
  const passed = !fromKey || todayKey >= fromKey;
  const current = passed && (!toKey || todayKey <= toKey);
  return { passed, current };
}
