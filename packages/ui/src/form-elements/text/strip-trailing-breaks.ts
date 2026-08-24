const INLINE_TAGS = new Set([
  'STRONG',
  'EM',
  'B',
  'I',
  'U',
  'S',
  'A',
  'SPAN',
  'MARK',
  'SUB',
  'SUP',
  'SMALL',
]);

const BLOCK_SELECTOR = 'p, div, li, h1, h2, h3, h4, h5, h6, blockquote';

function trimTrailing(el: Element): void {
  while (el.lastChild) {
    const last = el.lastChild;
    if (last.nodeType === Node.TEXT_NODE && !last.textContent?.trim()) {
      el.removeChild(last);
      continue;
    }
    if (last.nodeType === Node.ELEMENT_NODE) {
      const lastEl = last as Element;
      if (lastEl.tagName === 'BR') {
        el.removeChild(lastEl);
        continue;
      }
      if (INLINE_TAGS.has(lastEl.tagName)) {
        trimTrailing(lastEl);
        if (!lastEl.hasChildNodes()) {
          el.removeChild(lastEl);
          continue;
        }
      }
    }
    break;
  }
}

/**
 * Trix appends trailing <br> elements to block ends when it serializes
 * editor content, so every load/serialize round-trip grows the stored
 * HTML. This strips those meaningless trailing breaks while keeping
 * intentional empty-line blocks (like <p><br></p>) and breaks in the
 * middle of a block intact.
 */
export function stripTrailingBreaks(html: string): string {
  if (!html || typeof document === 'undefined') return html;
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  body.querySelectorAll(BLOCK_SELECTOR).forEach((block) => {
    const hadContent = block.hasChildNodes();
    trimTrailing(block);
    if (hadContent && !block.hasChildNodes()) {
      block.appendChild(document.createElement('br'));
    }
  });
  return body.innerHTML;
}
