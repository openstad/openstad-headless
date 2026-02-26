import '@utrecht/component-library-css';
import { AccordionProvider } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

import RenderContent from '../../../ui/src/rte-formatting/rte-formatting';
import './accordion.css';

interface Item {
  content: any;
  label: string;
  headingLevel?: number;
}

function Accordion({ content, label, headingLevel = 2 }: Item) {
  return (
    <AccordionProvider
      sections={[
        {
          headingLevel: headingLevel,
          body: (
            <div
              className="rte"
              dangerouslySetInnerHTML={{ __html: RenderContent(content) }}
            />
          ),
          expanded: false,
          label: label,
        },
      ]}
    />
  );
}

Accordion.loadWidgetOnElement = function (
  this: any,
  container: HTMLElement,
  props: any
) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
};

export { Accordion };
