import type { ApiStatus } from '@openstad-headless/types';

export async function getOrCreateStatus(
  statusName: string,
  seqnr: number,
  existingStatuses: ApiStatus[],
  createStatusFn: (
    name: string,
    seqnr: number,
    addToNewResources: boolean
  ) => Promise<ApiStatus>
): Promise<number> {
  // Case-insensitive matching to avoid duplicates
  const existing = existingStatuses.find(
    (s) => s.name.toLowerCase() === statusName.toLowerCase()
  );

  if (existing) {
    return existing.id;
  }

  const newStatus = await createStatusFn(statusName, seqnr, false);
  return newStatus.id;
}

export async function processStatuses(
  value: { statuses?: string },
  existingStatuses: ApiStatus[],
  createStatusFn: (
    name: string,
    seqnr: number,
    addToNewResources: boolean
  ) => Promise<ApiStatus>
): Promise<number[]> {
  if (!value.statuses) {
    return [];
  }

  const statusNames = value.statuses
    .trim()
    .split('|')
    .map((name: string) => name.trim())
    .filter((name: string) => name.length > 0);

  if (statusNames.length === 0) {
    return [];
  }

  // Find the highest sequence number
  const maxSeqnr =
    existingStatuses.length > 0
      ? Math.max(...existingStatuses.map((s) => s.seqnr || 0))
      : 0;

  const statusIds: number[] = [];

  for (let i = 0; i < statusNames.length; i++) {
    const statusId = await getOrCreateStatus(
      statusNames[i],
      maxSeqnr + (i + 1),
      existingStatuses,
      createStatusFn
    );
    statusIds.push(statusId);
  }

  return statusIds;
}

export function extractUniqueStatuses(
  values: { statuses?: string }[]
): Set<string> {
  const unique = new Set<string>();
  values.forEach((row) => {
    if (row.statuses) {
      const names = row.statuses
        .trim()
        .split('|')
        .map((n: string) => n.trim());
      names.forEach((n: string) => n && unique.add(n));
    }
  });
  return unique;
}

export async function prepareStatuses(
  uniqueStatuses: Set<string>,
  existingStatuses: ApiStatus[],
  createStatusFn: (
    name: string,
    seqnr: number,
    addToNewResources: boolean
  ) => Promise<ApiStatus>
): Promise<Map<string, number>> {
  const mapping = new Map<string, number>();
  const maxSeqnr =
    existingStatuses.length > 0
      ? Math.max(...existingStatuses.map((s) => s.seqnr || 0))
      : 0;

  let index = 1;
  for (const statusName of Array.from(uniqueStatuses)) {
    const statusId = await getOrCreateStatus(
      statusName,
      maxSeqnr + index,
      existingStatuses,
      createStatusFn
    );
    mapping.set(statusName.toLowerCase(), statusId);
    index++;
  }

  return mapping;
}
