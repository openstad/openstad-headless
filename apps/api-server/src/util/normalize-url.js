const WRAPPING_QUOTES = '"\'“”‘’';

// Unicode space separators other than a plain U+0020 — Word/Excel and rich-text
// editors emit these instead of a normal space. Written with \u escapes on
// purpose: the literal characters are indistinguishable from a space in a source
// file, which is how this replacement came to map a space onto itself — a no-op
// CodeQL flagged, and which left every separator below unhandled.
const UNICODE_SPACES = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;

// Strips quotes from both ends. Written as a loop rather than a regex on
// purpose: an anchored /["']+$/ backtracks quadratically, and with a 10mb body
// limit a long run of quotes would block the event loop for minutes.
function stripWrappingQuotes(value) {
  let start = 0;
  let end = value.length;

  while (start < end && WRAPPING_QUOTES.includes(value[start])) start++;
  while (end > start && WRAPPING_QUOTES.includes(value[end - 1])) end--;

  return value.slice(start, end);
}

// Normalizes user-contributed URLs. Programs like Word/Excel silently replace
// straight quotes, hyphens and regular spaces with typographic variants; we map
// those back before validating. Only http/https URLs are accepted.
//
// Returns { ok: true, value } with the normalized value, or { ok: false } when
// the input is not a valid http/https URL.
function normalizeContributedUrl(value) {
  // Only an absent value is passed through. Any other non-string (array,
  // object, number) is rejected: accepting it would let a value straight from
  // the API skip the validation below and be stored unchecked.
  if (value === null || typeof value === 'undefined') {
    return { ok: true, value: value };
  }
  if (typeof value !== 'string') {
    return { ok: false };
  }
  if (value.replace(UNICODE_SPACES, ' ').trim() === '') {
    return { ok: true, value: value };
  }

  // Copying a link from Word wraps it in quotes. Those have to be stripped
  // rather than kept, otherwise the scheme check below sees a leading quote,
  // prepends "https://" and produces a URL that parses but is dead.
  let normalized = stripWrappingQuotes(
    value
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[–—]/g, '-')
      .replace(UNICODE_SPACES, ' ')
      .trim()
  ).trim();

  // Only prepend a scheme when none is present. A leading "scheme:" (e.g.
  // http, https, mailto, ftp) is detected case-insensitively per RFC 3986, so
  // "HTTP://..." is kept intact instead of being turned into "https://HTTP://...".
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(normalized);
  if (!hasScheme) {
    normalized = 'https://' + normalized;
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch (_) {
    return { ok: false };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false };
  }

  // Return the parsed URL rather than the input: new URL() drops tabs and
  // newlines and percent-encodes characters such as < > " before parsing, so
  // returning the raw input would store a value that differs from the one that
  // was validated.
  return { ok: true, value: parsed.href };
}

module.exports = { normalizeContributedUrl };
