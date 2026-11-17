export function formatFileSize(bytes: number | undefined): string | undefined {
  if (bytes === undefined || bytes === null) return undefined;
  if (bytes === 0) return '0b';
  if (bytes < 1024) return `${bytes}b`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}kb`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`;
}

export function getFileFormat(
  filename: string | undefined
): string | undefined {
  if (!filename) return undefined;
  const segment = filename.split(/[?#]/)[0].split('/').pop() || '';
  const lastDot = segment.lastIndexOf('.');
  if (lastDot === -1 || lastDot === segment.length - 1) return undefined;
  return segment.slice(lastDot + 1).toUpperCase();
}
