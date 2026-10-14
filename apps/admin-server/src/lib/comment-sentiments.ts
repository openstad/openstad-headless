const DEFAULT_SENTIMENTS = ['for', 'against'];

/** The sentiment list of a stored value, which can be a list or its JSON text. */
export function sentimentList(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value !== '') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (error) {
      console.error('Invalid sentiment list', value, error);
    }
  }
  return [...DEFAULT_SENTIMENTS];
}
