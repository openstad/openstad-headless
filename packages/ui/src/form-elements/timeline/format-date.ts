/**
 * Format an ISO date string ("2026-06-17") to a Dutch long date
 * ("17 juni 2026"). String-based (no Date parsing) so it never shifts
 * across timezones — keeps the editor list and the read-only timeline
 * display perfectly consistent.
 */
export function formatDutchDate(isoDate: string): string {
  if (!isoDate) return '';
  const months = [
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
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} ${months[month - 1]} ${year}`;
}
