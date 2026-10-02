import { fillTimelineEndDates } from '@openstad-headless/lib/timeline-dates';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type TimelineItem = {
  trigger: string;
  title?: string;
  activeFrom?: string;
  activeTo?: string;
};

/**
 * Sort timeline items by start date, renumber the triggers to match that
 * order and recompute the automatic end dates. Items sharing a start date
 * keep the order in which they were added.
 */
export function normalizeTimelineItems<T extends TimelineItem>(
  items: T[]
): T[] {
  const sorted = [...items].sort((a, b) =>
    (a.activeFrom ?? '').localeCompare(b.activeFrom ?? '')
  );
  const renumbered = sorted.map((item, index) => ({
    ...item,
    trigger: String(index),
  }));
  return fillTimelineEndDates(renumbered);
}

/**
 * The title an editor entered. The resource form used to store the date as
 * title when the title was left empty; those count as having no title.
 */
export function getCustomTitle(title?: string): string {
  const trimmed = (title ?? '').trim();
  return DATE_ONLY_REGEX.test(trimmed) ? '' : trimmed;
}

type LinkLike = { trigger: string; title: string; url: string };

/** Drop links without a url and title, and renumber the rest in order. */
export function cleanLinks<T extends LinkLike>(links: T[]): T[] {
  return links
    .filter((link) => link.url.trim() !== '' || link.title.trim() !== '')
    .map((link, index) => ({ ...link, trigger: String(index) }));
}

/** Move an entry one position up or down; unchanged at the edges. */
export function moveEntry<T>(
  entries: T[],
  index: number,
  direction: 'up' | 'down'
): T[] {
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || index >= entries.length) return entries;
  if (target < 0 || target >= entries.length) return entries;
  const moved = [...entries];
  [moved[index], moved[target]] = [moved[target], moved[index]];
  return moved;
}
