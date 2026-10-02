import { DUTCH_MONTHS, formatDutchDate } from './timeline-dates';

/**
 * How precise the date of a timeline item is. The start date (`activeFrom`)
 * always holds the first day of the period, so sorting and the "reached"
 * marker keep working for every precision.
 */
export const DATE_PRECISIONS = [
  'day',
  'week',
  'month',
  'quarter',
  'year',
  'text',
] as const;

export type DatePrecision = (typeof DATE_PRECISIONS)[number];

export const DATE_PRECISION_LABELS: Record<DatePrecision, string> = {
  day: 'Dag',
  week: 'Week',
  month: 'Maand',
  quarter: 'Kwartaal',
  year: 'Jaar',
  text: 'Vrije tekst',
};

export const DATE_LABEL_MAX_LENGTH = 60;

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

type DatedItem = {
  activeFrom?: string;
  datePrecision?: string;
  dateLabel?: string;
};

const pad = (value: number) => String(value).padStart(2, '0');

/** Uppercase the first letter, for a label that starts with a month name. */
export const capitalizeFirst = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const toIso = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

function parseIso(iso?: string): Date | null {
  if (!iso || !DATE_ONLY_REGEX.test(iso)) return null;
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Reject dates that roll over, such as 2026-02-31.
  return date.getUTCMonth() === month - 1 ? date : null;
}

/** Monday-based weekday index: Monday = 0 ... Sunday = 6. */
const weekday = (date: Date) => (date.getUTCDay() + 6) % 7;

/** The precision of an item; items without one are exact days. */
export function getDatePrecision(item: DatedItem): DatePrecision {
  return (DATE_PRECISIONS as readonly string[]).includes(
    item.datePrecision ?? ''
  )
    ? (item.datePrecision as DatePrecision)
    : 'day';
}

/** ISO 8601 week number and week-year of a YYYY-MM-DD date. */
export function getIsoWeek(iso: string): { year: number; week: number } | null {
  const date = parseIso(iso);
  if (!date) return null;
  // The Thursday of a week decides which year the week belongs to.
  const thursday = new Date(date.getTime() + (3 - weekday(date)) * DAY_MS);
  const year = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const firstThursday = new Date(jan4.getTime() + (3 - weekday(jan4)) * DAY_MS);
  const week =
    1 +
    Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
  return { year, week };
}

/** The Monday of an ISO week as YYYY-MM-DD; '' when the week does not exist. */
export function isoWeekToDate(year: number, week: number): string {
  if (!Number.isInteger(year) || !Number.isInteger(week)) return '';
  if (week < 1 || week > 53) return '';
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const firstMonday = jan4.getTime() - weekday(jan4) * DAY_MS;
  const iso = toIso(new Date(firstMonday + (week - 1) * 7 * DAY_MS));
  const check = getIsoWeek(iso);
  return check && check.year === year && check.week === week ? iso : '';
}

/**
 * The date of a timeline item as shown to visitors, for example
 * "28 september 2026", "Week 46, 2026", "Mei 2027", "Q3 2027", "2027" or the
 * free text an editor entered.
 */
export function formatTimelineDate(item: DatedItem): string {
  const precision = getDatePrecision(item);
  const label = (item.dateLabel ?? '').trim();
  if (precision === 'text' && label) return label;

  const date = parseIso(item.activeFrom);
  if (!date) return '';
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();

  switch (precision) {
    case 'week': {
      const isoWeek = getIsoWeek(item.activeFrom as string);
      return isoWeek ? `Week ${isoWeek.week}, ${isoWeek.year}` : '';
    }
    case 'month':
      return `${capitalizeFirst(DUTCH_MONTHS[month])} ${year}`;
    case 'quarter':
      return `Q${Math.floor(month / 3) + 1} ${year}`;
    case 'year':
      return `${year}`;
    default:
      return formatDutchDate(item.activeFrom as string);
  }
}

/**
 * A machine-readable value for the `datetime` attribute of a `<time>`
 * element, or undefined when the date has no such form (quarter, free text).
 */
export function getTimelineDateTime(item: DatedItem): string | undefined {
  const date = parseIso(item.activeFrom);
  if (!date) return undefined;

  switch (getDatePrecision(item)) {
    case 'day':
      return item.activeFrom;
    case 'week': {
      const isoWeek = getIsoWeek(item.activeFrom as string);
      return isoWeek ? `${isoWeek.year}-W${pad(isoWeek.week)}` : undefined;
    }
    case 'month':
      return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
    case 'year':
      return `${date.getUTCFullYear()}`;
    default:
      return undefined;
  }
}

/** The values of the date controls in an editor, all as strings. */
export type TimelineDateInput = {
  precision: DatePrecision;
  /** Exact date (day) or expected date (free text), YYYY-MM-DD. */
  date: string;
  week: string;
  /** 1-12 */
  month: string;
  /** 1-4 */
  quarter: string;
  year: string;
  label: string;
};

/**
 * Fill the date controls from a stored item. Every part is derived from the
 * start date, so switching to another precision starts from a sensible value.
 */
export function toTimelineDateInput(
  item: DatedItem = {},
  today: Date = new Date()
): TimelineDateInput {
  const precision = getDatePrecision(item);
  const date = parseIso(item.activeFrom);
  const isoWeek = date ? getIsoWeek(item.activeFrom as string) : null;
  const year = date ? date.getUTCFullYear() : today.getFullYear();

  return {
    precision,
    date: date ? (item.activeFrom as string) : '',
    week: isoWeek ? String(isoWeek.week) : '',
    month: String(date ? date.getUTCMonth() + 1 : 1),
    quarter: String(date ? Math.floor(date.getUTCMonth() / 3) + 1 : 1),
    year: String(precision === 'week' && isoWeek ? isoWeek.year : year),
    label: item.dateLabel ?? '',
  };
}

export type TimelineDateFields = {
  activeFrom: string;
  datePrecision?: DatePrecision;
  dateLabel?: string;
};

export type TimelineDateResult =
  { ok: true; fields: TimelineDateFields } | { ok: false; error: string };

const toInteger = (value: string) =>
  /^\d+$/.test(value.trim()) ? parseInt(value.trim(), 10) : NaN;

/**
 * Turn the date controls into the fields stored on a timeline item. Exact
 * days are stored without a precision, like items made before this existed.
 */
export function fromTimelineDateInput(
  input: TimelineDateInput
): TimelineDateResult {
  const invalid = (error: string): TimelineDateResult => ({ ok: false, error });
  const valid = (fields: TimelineDateFields): TimelineDateResult => ({
    ok: true,
    fields,
  });

  if (input.precision === 'day') {
    return parseIso(input.date)
      ? valid({ activeFrom: input.date })
      : invalid('Vul een geldige datum in.');
  }

  if (input.precision === 'text') {
    const label = input.label.trim();
    if (!label) return invalid('Vul een tekst in.');
    if (label.length > DATE_LABEL_MAX_LENGTH) {
      return invalid(
        `De tekst mag maximaal ${DATE_LABEL_MAX_LENGTH} tekens lang zijn.`
      );
    }
    if (!parseIso(input.date)) return invalid('Vul een verwachte datum in.');
    return valid({
      activeFrom: input.date,
      datePrecision: 'text',
      dateLabel: label,
    });
  }

  const year = toInteger(input.year);
  if (!(year >= 1900 && year <= 2200))
    return invalid('Vul een geldig jaar in.');

  if (input.precision === 'year') {
    return valid({ activeFrom: `${year}-01-01`, datePrecision: 'year' });
  }

  if (input.precision === 'quarter') {
    const quarter = toInteger(input.quarter);
    if (!(quarter >= 1 && quarter <= 4)) return invalid('Kies een kwartaal.');
    return valid({
      activeFrom: `${year}-${pad((quarter - 1) * 3 + 1)}-01`,
      datePrecision: 'quarter',
    });
  }

  if (input.precision === 'month') {
    const month = toInteger(input.month);
    if (!(month >= 1 && month <= 12)) return invalid('Kies een maand.');
    return valid({
      activeFrom: `${year}-${pad(month)}-01`,
      datePrecision: 'month',
    });
  }

  const week = toInteger(input.week);
  if (!(week >= 1 && week <= 53)) {
    return invalid('Vul een weeknummer in van 1 tot en met 53.');
  }
  const monday = isoWeekToDate(year, week);
  if (!monday) return invalid(`Week ${week} bestaat niet in ${year}.`);
  return valid({ activeFrom: monday, datePrecision: 'week' });
}
