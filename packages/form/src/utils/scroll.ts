export type ErrorTarget = {
  scrollTarget: HTMLElement;
  focusTarget: HTMLElement;
};

const SCROLL_OFFSET = 100;

// An element without a layout box (a type="hidden" input for e.g. a map field,
// or anything display:none) cannot be scrolled to or focused.
const hasLayoutBox = (element: HTMLElement): boolean =>
  element.getClientRects().length > 0;

/**
 * Picks the error field that is highest in the viewport, so form order or
 * routing cannot make a lower field win. Falls back to the visible .question
 * wrapper for fields without a visible input.
 */
export const findFirstErrorTarget = (
  root: ParentNode,
  errorKeys: string[]
): ErrorTarget | null => {
  let target: ErrorTarget | null = null;
  let targetTop = Infinity;

  errorKeys.forEach((key) => {
    const namedElement = root.querySelector<HTMLElement>(`[name="${key}"]`);
    if (!namedElement) {
      return;
    }

    // Checkbox, radio, matrix and image-choice render their own inner
    // .question, so walk up to the outermost one: that is the wrapper holding
    // the label and the error message.
    let wrapper = namedElement.closest<HTMLElement>('.question');
    let outerWrapper =
      wrapper?.parentElement?.closest<HTMLElement>('.question');
    while (outerWrapper) {
      wrapper = outerWrapper;
      outerWrapper = wrapper.parentElement?.closest<HTMLElement>('.question');
    }

    const scrollTarget = wrapper ?? namedElement;
    const top = scrollTarget.getBoundingClientRect().top;

    if (top < targetTop) {
      targetTop = top;
      target = {
        scrollTarget,
        focusTarget: hasLayoutBox(namedElement) ? namedElement : scrollTarget,
      };
    }
  });

  return target;
};

/**
 * Scrolls to and focuses the first (topmost) error. Runs one frame later so the
 * just-rendered error messages are part of the measured positions. Focus is
 * required for keyboard and screen reader users (WCAG 3.3.1 / 2.4.3).
 */
export const scrollToFirstError = (
  root: ParentNode,
  errorKeys: string[]
): void => {
  requestAnimationFrame(() => {
    const target = findFirstErrorTarget(root, errorKeys);
    if (!target) {
      return;
    }

    const { scrollTarget, focusTarget } = target;
    window.scrollTo({
      top:
        scrollTarget.getBoundingClientRect().top +
        window.scrollY -
        SCROLL_OFFSET,
      behavior: 'smooth',
    });

    if (focusTarget.tabIndex < 0) {
      focusTarget.setAttribute('tabindex', '-1');
    }
    focusTarget.focus({ preventScroll: true });
  });
};
