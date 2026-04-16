export function isSafeUrl(url: string): boolean {
  const value = url.trim();
  if (!value) return false;
  if (/[\x00-\x1f\x7f]/.test(value)) return false;

  try {
    const parsed = new URL(value, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeColor(color: string): string {
  if (/^#[0-9A-Fa-f]{3,8}$/.test(color)) return color;
  if (/^(rgb|hsl)a?\([^)]+\)$/.test(color)) return color;
  if (/^[a-zA-Z]+$/.test(color)) return color;
  return '#000000';
}
