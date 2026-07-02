// Normalizes user-contributed URLs. Programs like Word/Excel silently replace
// straight quotes, hyphens and regular spaces with typographic variants; we map
// those back before validating. Only http/https URLs are accepted.
//
// Returns { ok: true, value } with the normalized value, or { ok: false } when
// the input is not a valid http/https URL.
function normalizeContributedUrl(value) {
  if (typeof value !== 'string' || value.replace(/ /g, ' ').trim() === '') {
    return { ok: true, value: value };
  }

  let normalized = value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/ /g, ' ')
    .trim();

  // Only prepend a scheme when none is present. A leading "scheme:" (e.g.
  // http, https, mailto, ftp) is detected case-insensitively per RFC 3986, so
  // "HTTP://..." is kept intact instead of being turned into "https://HTTP://...".
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(normalized);
  if (!hasScheme) {
    normalized = 'https://' + normalized;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false };
    }
  } catch (_) {
    return { ok: false };
  }

  return { ok: true, value: normalized };
}

module.exports = { normalizeContributedUrl };
