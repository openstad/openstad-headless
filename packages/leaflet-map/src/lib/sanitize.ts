export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return !url.toLowerCase().trimStart().startsWith('javascript:');
  }
}

export function sanitizeColor(color: string): string {
  if (/^#[0-9A-Fa-f]{3,8}$/.test(color)) return color;
  if (/^(rgb|hsl)a?\([^)]+\)$/.test(color)) return color;
  if (/^[a-zA-Z]+$/.test(color)) return color;
  return '#000000';
}
