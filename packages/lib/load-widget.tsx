import React from 'react';
import { createRoot } from 'react-dom/client';

export default function loadWidget(this: any, elementId: string, props: any) {
  const Component = this;

  const container = document.getElementById(elementId);

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
}
