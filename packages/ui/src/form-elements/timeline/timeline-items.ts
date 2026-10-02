import {
  fillTimelineEndDates,
  formatDutchDate,
} from '@openstad-headless/lib/timeline-dates';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type TimelineListItem = {
  trigger: string;
  title?: string;
  activeFrom: string;
  activeTo?: string;
};

/**
 * Sort the items by start date, renumber the triggers to match that order and
 * recompute the automatic end dates. Items sharing a start date keep the order
 * in which they were added.
 */
export function normalizeItems<T extends TimelineListItem>(items: T[]): T[] {
  const sorted = [...items].sort((a, b) =>
    a.activeFrom < b.activeFrom ? -1 : a.activeFrom > b.activeFrom ? 1 : 0
  );
  const renumbered = sorted.map((item, idx) => ({
    ...item,
    trigger: String(idx),
  }));
  return fillTimelineEndDates(renumbered);
}

/**
 * The title an editor entered. Older items stored the date as title when the
 * title was left empty; those count as having no title.
 */
export function getCustomTitle(item: Pick<TimelineListItem, 'title'>): string {
  const title = (item.title ?? '').trim();
  return DATE_ONLY_REGEX.test(title) ? '' : title;
}

/** Label for an item in the list: "date – title", or just the date. */
export function getItemLabel(
  item: Pick<TimelineListItem, 'title' | 'activeFrom'>
): string {
  const date = formatDutchDate(item.activeFrom);
  const title = getCustomTitle(item);
  if (date && title) return `${date} – ${title}`;
  return date || title;
}
