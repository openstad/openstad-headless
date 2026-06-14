/**
 * Sanitize a user-supplied URL before using it as an `href`.
 *
 * Timeline links are submitter-controlled and rendered as anchors on public
 * detail pages, so a `javascript:`/`data:`/`vbscript:` URL would be a stored
 * XSS vector (executes when a viewer, e.g. a moderator, clicks the link).
 *
 * Allowed: http(s), mailto, tel, and relative/anchor links ("/x", "./x",
 * "../x", "#x", "?x"). Anything carrying a disallowed scheme is dropped to an
 * empty string. Whitespace and control characters are stripped before the
 * scheme check so a tab/newline smuggled into "javascript:" can't slip through.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';

  // Relative paths and in-page anchors are always safe.
  if (/^(\/|\.\/|\.\.\/|#|\?)/.test(trimmed)) return trimmed;

  // Strip whitespace + control chars so a smuggled scheme can't hide behind
  // an embedded tab, newline, or null byte.
  // eslint-disable-next-line no-control-regex
  const stripped = trimmed.replace(/[\u0000-\u0020\u007f]/g, '');

  // Explicitly allowed schemes pass through with the original value.
  if (/^(https?:|mailto:|tel:)/i.test(stripped)) return trimmed;

  // Any other explicit scheme (javascript:, data:, vbscript:, ...) is dropped.
  if (/^[a-z][a-z0-9+.-]*:/i.test(stripped)) return '';

  // No scheme at all: treat as a relative path, safe to render.
  return trimmed;
}
