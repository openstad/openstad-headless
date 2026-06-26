const KNOWN_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'csv', 'txt', 'zip', 'png', 'jpg', 'jpeg', 'gif', 'svg',
];

// Removes the query string and hash fragment from a URL.
function stripUrlParams(url: string): string {
  return url.split('?')[0].split('#')[0];
}

// Removes a trailing dotted extension, e.g. "report.pdf" -> "report".
function stripDottedExtension(value: string): string {
  return value.replace(/\.[^.]+$/, '');
}

// Returns the lowercase extension of a path, or '' if there is none.
function getExtension(path: string): string {
  if (!path.includes('.')) return '';
  return path.split('.').pop()?.toLowerCase() ?? '';
}

// Returns the extension of a URL, ignoring query string and hash.
function getExtensionFromUrl(url: string): string {
  return getExtension(stripUrlParams(url));
}

// Returns the file name (without extension) from a URL, used as a
// fallback when the document has no stored name.
function getFileNameFromUrl(url: string): string {
  const path = stripUrlParams(url);
  if (!path) return '';
  return stripDottedExtension(path.split('/').pop() ?? '');
}

// Removes a trailing "_pdf" / "-docx" style suffix, but only when it
// matches a known extension (so legitimate words in titles are kept).
// Returns the cleaned base and the matched extension, if any.
function stripKnownSuffix(name: string): { base: string; extension: string } {
  const pattern = new RegExp(`[_-](${KNOWN_EXTENSIONS.join('|')})$`, 'i');
  const match = name.match(pattern);
  return {
    base: name.replace(pattern, ''),
    extension: match ? match[1].toLowerCase() : '',
  };
}

// Determines the file type. The stored name may not contain a real
// extension (it can be transformed to a "_pdf" style suffix), so the URL
// is the most reliable source. Priority: URL > stripped suffix > name.
function deriveExtension(
  urlExtension: string,
  suffixExtension: string,
  rawName: string
): string {
  if (KNOWN_EXTENSIONS.includes(urlExtension)) return urlExtension;
  if (suffixExtension) return suffixExtension;
  return getExtension(rawName);
}

// Turns underscores/hyphens into spaces and capitalizes the first letter.
function humanizeBase(base: string): string {
  const words = base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Formats a byte count into a human-readable size using Dutch notation
// (comma as decimal separator), e.g. 1300000 -> "1,2 MB", 5000 -> "5 kB".
function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.max(1, Math.round(kb))} kB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(1).replace('.', ',')} MB`;
}

// Builds an accessible, human-readable label for a document link,
// e.g. "Groenontwerp Burggraafstraat (PDF, 1,2 MB)". The size is omitted
// when it is not available (e.g. for documents uploaded before size was
// stored), falling back to "Title (PDF)".
export function formatDocumentLabel(
  name?: string,
  url?: string,
  size?: number
): string {
  const rawName = name || '';
  const documentUrl = url || '';

  const { base: strippedBase, extension: suffixExtension } =
    stripKnownSuffix(stripDottedExtension(rawName));

  const base = strippedBase || getFileNameFromUrl(documentUrl);

  const extension = deriveExtension(
    getExtensionFromUrl(documentUrl),
    suffixExtension,
    rawName
  );

  const title = humanizeBase(base);
  const fileSize = size === undefined ? '' : formatFileSize(size);

  const meta = [extension.toUpperCase(), fileSize].filter(Boolean).join(', ');
  return meta ? `${title} (${meta})` : title;
}