export function characterLimitError({
  length,
  min,
  max,
  minErrorText,
  maxErrorText,
}: {
  length: number;
  min: number;
  max: number;
  minErrorText?: string;
  maxErrorText?: string;
}): string {
  if (length < min) {
    const text =
      minErrorText || 'Tekst moet minimaal {minCharacters} karakters bevatten';
    return text.replace('{minCharacters}', min.toString());
  }

  const text =
    maxErrorText || 'Tekst moet maximaal {maxCharacters} karakters bevatten';
  return text.replace('{maxCharacters}', String(max));
}
