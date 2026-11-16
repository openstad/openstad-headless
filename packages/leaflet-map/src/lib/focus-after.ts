const TABBABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

// Skip link target. Focusing an empty div (tabindex=-1) gives invisible focus
// on an empty element (WCAG 2.4.3/2.4.7, audit 24984), so move focus to the
// first visible, tabbable element after `marker` instead. If nothing follows
// on the page, focus the marker itself so Tab can continue from there.
// Linear scan over all tabbable elements, which is fine for a single page.
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
