'use strict';

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Nunjucks-filter voor URL's uit admin-config (menu-links, taalwissel).
 * Staat relatieve paden en http(s)/mailto/tel toe; alles met een ander of
 * onparseerbaar scheme (javascript:, data:, protocol-relative //host)
 * levert een lege string op. Attribute-escaping doet nunjucks-autoescape.
 */
function safeRelativeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed === '') return '';

  if (trimmed.startsWith('//')) return '';
  if (/^[/#?]/.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (SAFE_PROTOCOLS.includes(parsed.protocol)) return trimmed;
  } catch {
    return '';
  }

  return '';
}

module.exports = { safeRelativeUrl };
