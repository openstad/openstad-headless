import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

export function loadWidget(this: any, elementId: string, props: any) {

  const Component = this;
    const root = window?.shortcodeShadow?.[elementId];
    const container = root?.getElementById(elementId) || document.getElementById(elementId);
    container.classList.add('openstad');

    if (container) {
      const reactRoot = createRoot(container);
      reactRoot.render(<Component {...props} />);
    } else {
      console.error('No container found for widget:', elementId);
    }


}