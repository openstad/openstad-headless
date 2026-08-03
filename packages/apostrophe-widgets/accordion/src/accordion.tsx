import '@utrecht/component-library-css';
import { AccordionProvider } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import RenderContent from '../../../ui/src/rte-formatting/rte-formatting';
import './accordion.css';

interface Item {
  content: any;
  label: string;
  headingLevel?: number;
}

function Accordion({ content, label, headingLevel = 2 }: Item) {
  const ref = useRef<HTMLDivElement>(null);

  // ponytail: de chevron-svg uit de Utrecht-accordeon heeft naast de knoptekst geen
  // meerwaarde; als decoratief markeren zodat hij niet als 'afbeelding' voorgelezen wordt (1.1.1).
  // ponytail: één keer bij mount; Utrecht flipt de chevron via CSS, niet door de svg te hermounten.
  useEffect(() => {
    ref.current
      ?.querySelectorAll('.utrecht-accordion__button-icon')
      .forEach((el) => {
        el.setAttribute('aria-hidden', 'true');
        el.setAttribute('focusable', 'false');
      });
  }, []);

  return (
    <div ref={ref}>
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
            section: true,
          },
        ]}
      />
    </div>
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
