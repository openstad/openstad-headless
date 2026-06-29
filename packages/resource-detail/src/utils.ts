const KNOWN_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'csv',
  'txt',
  'zip',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
];

// Returns the lowercase extension of a path, or '' if there is none.
function getExtension(path: string): string {
  if (!path.includes('.')) return '';
  return path.split('.').pop()?.toLowerCase() ?? '';
}

// Strips query string and hash from a URL, then returns its extension.
function getExtensionFromUrl(url: string): string {
  const path = url.split('?')[0].split('#')[0];
  return getExtension(path);
}

// Returns the file name (without extension) from a URL path, used as a
// fallback when the document has no stored name.
function getFileNameFromUrl(url: string): string {
  const path = url.split('?')[0].split('#')[0];
  if (!path) return '';
  return (
    path
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '') ?? ''
  );
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

// Builds an accessible, human-readable label for a document link,
// e.g. "Groenontwerp Burggraafstraat (PDF)".
export function formatDocumentLabel(name?: string, url?: string): string {
  const rawName = name || '';
  const documentUrl = url || '';

  const withoutDottedExtension = rawName.replace(/\.[^.]+$/, '');
  const { base: strippedBase, extension: suffixExtension } = stripKnownSuffix(
    withoutDottedExtension
  );

  const base = strippedBase || getFileNameFromUrl(documentUrl);

  const extension = deriveExtension(
    getExtensionFromUrl(documentUrl),
    suffixExtension,
    rawName
  );

  const title = humanizeBase(base);
  return extension ? `${title} (${extension.toUpperCase()})` : title;
}
