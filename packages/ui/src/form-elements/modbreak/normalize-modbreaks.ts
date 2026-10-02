export type ModbreakItem = {
  id: string;
  description: string;
  authorName?: string | null;
  modBreakDate: string;
  createdAt?: string;
};

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_LOCAL_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

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

export const EMPTY_MODBREAK_MESSAGE =
  'Vul de inhoud in of verwijder de lege modbreak.';

const INVISIBLE_CHARACTERS = /[\u200B-\u200D\uFEFF]/g;

export function hasModBreakContent(description?: string | null): boolean {
  if (!description) return false;
  return (
    description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;|&#160;|&#xa0;/gi, ' ')
      .replace(INVISIBLE_CHARACTERS, '')
      .trim().length > 0
  );
}

export function sortModBreaksDescending<T extends { modBreakDate: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) =>
    (b.modBreakDate || '').localeCompare(a.modBreakDate || '')
  );
}

export function normalizeModBreaks(items: ModbreakItem[]): ModbreakItem[] {
  return sortModBreaksDescending(
    items.map((item) => ({
      ...item,
      modBreakDate: normalizeModBreakDate(item.modBreakDate),
    }))
  );
}
