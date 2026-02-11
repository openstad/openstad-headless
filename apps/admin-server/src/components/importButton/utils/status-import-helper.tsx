import type { Status } from '@openstad-headless/types';

export async function getOrCreateStatus(
  statusName: string,
  seqnr: number,
  existingStatuses: Status[],
  createStatusFn: (name: string, seqnr: number, addToNewResources: boolean) => Promise<Status>
): Promise<number> {
  // Case-insensitive matching to avoid duplicates
  const existing = existingStatuses.find(
    (s) => s.name.toLowerCase() === statusName.toLowerCase()
  )
  
  if (existing) {
    return existing.id
  }
  
  const newStatus = await createStatusFn(statusName, seqnr, false)
  return newStatus.id
}

export async function processStatuses(
  value: { statuses?: string },
  existingStatuses: Status[],
  createStatusFn: (name: string, seqnr: number, addToNewResources: boolean) => Promise<Status>
): Promise<number[]> {
  if (!value.statuses) {
    return []
  }

  const statusNames = value.statuses
    .split('|')
    .map((name: string) => name.trim())
    .filter((name: string) => name.length > 0)
  
  if (statusNames.length === 0) {
    return []
  }
  
  // Find the highest sequence number
  const maxSeqnr = existingStatuses.length > 0 
    ? Math.max(...existingStatuses.map((s: any) => s.seqnr || 0))
    : 0
  
  const statusIds: number[] = []
  
  for (let i = 0; i < statusNames.length; i++) {
    const statusId = await getOrCreateStatus(
      statusNames[i],
      maxSeqnr + (i + 1),
      existingStatuses,
      createStatusFn
    )
    statusIds.push(statusId)
  }
  
  return statusIds
}