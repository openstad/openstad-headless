type ConfiguredItem = { type?: string; fieldKey?: string };

// Moves a field's value out of extraData into its own resource column (e.g. timeline -> resource.timeline).
// Mutates both objects in place, matching configureFormData's existing mutation style.
export function moveFieldToColumn(
  extraData: Record<string, any>,
  configuredFormData: Record<string, any>,
  items: ConfiguredItem[] | undefined,
  type: string,
  column: string
): void {
  const fieldKeys = (items || [])
    .filter((item) => item.type === type)
    .map((item) => item.fieldKey)
    .filter((key): key is string => !!key);

  if (fieldKeys.length > 1) {
    console.error(
      `[resource-form] multiple '${type}' fields configured; only '${fieldKeys[0]}' is moved to '${column}', the rest stay in extraData`
    );
  }

  const fieldKey = fieldKeys[0];
  if (fieldKey && typeof extraData[fieldKey] !== 'undefined') {
    configuredFormData[column] = extraData[fieldKey];
    delete extraData[fieldKey];
  }
}
