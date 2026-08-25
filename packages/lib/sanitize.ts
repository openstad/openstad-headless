// @ts-ignore
import DOMPurify from 'isomorphic-dompurify';

/**
 * Centrale HTML-sanitizer voor content die via dangerouslySetInnerHTML
 * wordt gerenderd. Werkt in de browser én server-side (Next.js SSR);
 * isomorphic-dompurify gebruikt jsdom in Node en mapt in browserbundels
 * naar het reguliere dompurify.
 *
 * USE_PROFILES html: alleen HTML-elementen, geen SVG/MathML (XSS-vectoren
 * zoals <svg><script>), met behoud van gangbare rte-markup: headings,
 * paragrafen, links (href/target/rel), lijsten, strong/em, tabellen,
 * afbeeldingen en class-attributen.
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(String(html), {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
  });
}

/**
 * Restrict image sources to network and relative URLs. In particular this
 * rejects executable schemes such as javascript: and data: before a value is
 * assigned to a DOM src attribute.
 */
export function sanitizeImageUrl(
  url: string | undefined | null
): string | undefined {
  if (typeof url !== 'string') return undefined;

  const value = url.trim();
  if (!value || /[\x00-\x1f\x7f<>"'`\\]/.test(value)) return undefined;

  try {
    const parsed = new URL(value, 'https://openstad.invalid');
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return undefined;
    }
  } catch {
    return undefined;
  }

  // Keep the final value on the same well-known sanitizer boundary used for
  // rich HTML. Besides providing defense in depth, this makes the validated
  // value explicit to static analyzers before it reaches a DOM attribute.
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
