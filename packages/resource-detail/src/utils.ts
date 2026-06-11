const KNOWN_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'csv', 'txt', 'zip', 'png', 'jpg', 'jpeg', 'gif', 'svg',
];

// Builds an accessible, human-readable label for a document link.
// The stored file name may not contain the original dot (extensions can
// appear as a "_pdf" style suffix), so the file type is preferably
// derived from the document URL. A trailing "_<ext>" suffix is only
// stripped when it matches a known extension, to avoid removing
// legitimate words from titles.
export function formatDocumentLabel(name?: string, url?: string): string {
  const rawName = name || '';
  const urlPath = (url || '').split('?')[0].split('#')[0];
  const urlExtension = urlPath.includes('.')
    ? urlPath.split('.').pop()?.toLowerCase() ?? ''
    : '';

  let base = rawName.replace(/\.[^.]+$/, '');

  const knownSuffix = new RegExp(`[_-](${KNOWN_EXTENSIONS.join('|')})$`, 'i');
  const suffixMatch = base.match(knownSuffix);
  base = base.replace(knownSuffix, '');

  if (!base && urlPath) {
    base = urlPath.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
  }

  const extension =
    (KNOWN_EXTENSIONS.includes(urlExtension) ? urlExtension : '') ||
    (suffixMatch ? suffixMatch[1].toLowerCase() : '') ||
    (rawName.includes('.') ? rawName.split('.').pop()?.toLowerCase() ?? '' : '');

  const title = base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const capitalized = title.charAt(0).toUpperCase() + title.slice(1);

  return extension ? `${capitalized} (${extension.toUpperCase()})` : capitalized;
}