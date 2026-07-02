// Strips all whitespace from a postcode input so a value like "1234 AA" is
// treated the same as "1234AA" when querying the autofill API. The visible
// input keeps its raw value; only the API lookup uses the sanitized form.
export const sanitizeZipInput = (value: string): string =>
  value.replace(/\s+/g, '');
