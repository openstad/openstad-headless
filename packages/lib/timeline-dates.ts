const DUTCH_MONTHS = [
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
