import React from 'react';
import { createRoot } from 'react-dom/client';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { AccordionProvider } from "@utrecht/component-library-react";

interface Item {
  body: string;
  label: string;
  expanded?: boolean | undefined;
};

function Accordion({body, label, expanded }: Item) {
  return (
    <AccordionProvider
      sections={[
        {
          body: body,
          expanded: expanded,
          label: label
        }
      ]}
    />
  )
}

Accordion.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
};

export { Accordion }; 