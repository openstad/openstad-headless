import type { Paginated } from '@openstad-headless/types';

// List endpoints return a plain array, or `{ metadata, records }` when paginated.
export type ListResponse<T> = T[] | Paginated<T>;

export function getRecords<T>(data?: ListResponse<T> | null): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : data.records || [];
}
