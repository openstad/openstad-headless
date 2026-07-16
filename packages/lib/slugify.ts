/**
 * Turn arbitrary text into a URL-friendly slug: lowercase, diacritics
 * stripped, non-alphanumeric runs collapsed to a single hyphen, and no
 * leading or trailing hyphens.
 */
export function slugify(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // drop combining accent marks (cafe -> cafe)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
