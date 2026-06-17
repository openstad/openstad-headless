function sanitizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';

  if (/^[/][/]/.test(trimmed)) return '';
  if (/^(\/|\.\/|\.\.\/|#|\?)/.test(trimmed)) return trimmed;

  const stripped = trimmed.replace(/[^\x21-\x7e]/g, '');

  if (/^(https?:|mailto:|tel:)/i.test(stripped)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(stripped)) return '';

  return trimmed;
}

module.exports = { sanitizeUrl };
