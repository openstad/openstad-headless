export const normalizeToArray = (value: any): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(v => String(v));
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(v => String(v));
      }
    } catch {
      return [value];
    }
    return [value];
  }

  return [String(value)];
};
