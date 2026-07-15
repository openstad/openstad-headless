import React from 'react';
import { createRoot } from 'react-dom/client';

function MountSignal({ target }: { target: HTMLElement }) {
  React.useEffect(() => {
    const dispatch = () =>
      document.dispatchEvent(
        new CustomEvent('nlds:content-updated', { detail: { element: target } })
      );

    dispatch();

    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(dispatch, 100);
    });
    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [target]);
  return null;
}

export function loadWidget(this: any, elementId: string, props: any) {
  const Component = this;

  const container = document.getElementById(elementId);

  if (container) {
    const root = createRoot(container);
    root.render(
      <>
        <Component {...props} />
        <MountSignal target={container} />
      </>
    );
  }
}
