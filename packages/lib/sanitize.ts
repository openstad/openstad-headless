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
