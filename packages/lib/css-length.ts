const CSS_LENGTH_UNITS = 'px|%|vh|vw|em|rem|ex|ch|vmin|vmax|cm|mm|in|pt|pc';

const BARE_NUMBER = /^\d+(\.\d+)?$/;
const NUMBER_WITH_UNIT = new RegExp(`^\\d+(\\.\\d+)?(${CSS_LENGTH_UNITS})$`);

export function toCssLength(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  if (BARE_NUMBER.test(trimmed)) return `${trimmed}px`;
  if (NUMBER_WITH_UNIT.test(trimmed)) return trimmed;

  return null;
}
