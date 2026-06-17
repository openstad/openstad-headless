export function findResourceIndex(
  targetKey: string | number | undefined,
  list: Array<{ id?: string | number; uniqueId?: string }>
): number {
  if (targetKey === undefined || targetKey === null) return -1;
  return list.findIndex((r) => r.id === targetKey || r.uniqueId === targetKey);
}
