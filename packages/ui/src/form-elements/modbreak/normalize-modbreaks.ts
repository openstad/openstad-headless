export type ModbreakItem = {
  id: string;
  description: string;
  authorName?: string | null;
  modBreakDate: string;
  createdAt?: string;
};

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_LOCAL_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

// Slice-based, no timezone conversion: mirrors resource-form.tsx so admin and frontend render the same stored value identically.
export function normalizeModBreakDate(value?: string | null): string {
  if (!value) return '';

  if (DATETIME_LOCAL_REGEX.test(value)) return value;

  if (DATE_ONLY_REGEX.test(value)) return `${value}T00:00`;

  if (value.includes('T')) {
    const candidate = value.slice(0, 16);
    return DATETIME_LOCAL_REGEX.test(candidate) ? candidate : '';
  }

  return '';
}

export function sortModBreaksDescending<T extends { modBreakDate: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) =>
    (b.modBreakDate || '').localeCompare(a.modBreakDate || '')
  );
}

// Single entry point used before every state update: keeps items normalized and sorted at all times.
export function normalizeModBreaks(items: ModbreakItem[]): ModbreakItem[] {
  return sortModBreaksDescending(
    items.map((item) => ({
      ...item,
      modBreakDate: normalizeModBreakDate(item.modBreakDate),
    }))
  );
}
