export function fromCsvIds(value?: string): string[] {
  return (value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function toCsvIds(ids: Array<string | number>): string {
  return ids
    .map(String)
    .filter((id, index, all) => id && all.indexOf(id) === index)
    .join(',');
}

export function toggleCsvId(
  value: string | undefined,
  id: string | number,
  checked: boolean
): string {
  const ids = fromCsvIds(value).filter((current) => current !== String(id));
  return toCsvIds(checked ? [...ids, String(id)] : ids);
}

export type NotificationTypeDefinition = { type: string; label: string };

export function mergeNotificationTypes(
  coreTypes: NotificationTypeDefinition[],
  pluginTypes: NotificationTypeDefinition[] = []
): NotificationTypeDefinition[] {
  const known = new Set(coreTypes.map((definition) => definition.type));
  return [
    ...coreTypes,
    ...pluginTypes.filter((definition) => !known.has(definition.type)),
  ];
}
