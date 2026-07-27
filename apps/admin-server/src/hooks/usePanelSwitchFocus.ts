import { useEffect, useRef } from 'react';

/*
 * For panels that swap each other out in the same slot (e.g. the question form
 * and the answer-options panel in the widget item editors): the browser keeps
 * the old scroll offset, so after switching you can end up below the new panel.
 * Scrolls the newly rendered panel into view and moves focus to it (WCAG 2.4.3).
 * Attach the returned ref (plus tabIndex={-1}) to the root element of both panels.
 */
export function usePanelSwitchFocus(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // preventScroll: otherwise focus() jumps instantly and cancels the smooth scroll
    ref.current?.focus({ preventScroll: true });
  }, [active]);

  return ref;
}
