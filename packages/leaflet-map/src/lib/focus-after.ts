const TABBABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

// ponytail: skiplink-doel. Focus op een leeg div (tabindex=-1) geeft een
// onzichtbare focus op een leeg element (WCAG 2.4.3/2.4.7, audit 24984).
// Daarom naar het eerstvolgende tabbare, zichtbare element ná `marker`.
// Niets meer op de pagina? Dan de marker zelf, zodat Tab verder kan.
// Lineaire scan over alle tabbare elementen — prima voor een pagina.
export function focusFirstTabbableAfter(marker: HTMLElement | null) {
  if (!marker) return;
  const next = Array.from(
    marker.ownerDocument.querySelectorAll<HTMLElement>(TABBABLE)
  ).find(
    (el) =>
      marker.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING &&
      !el.closest('[hidden], [inert], [aria-hidden="true"]') &&
      el.getClientRects().length > 0
  );
  (next ?? marker).focus();
}
