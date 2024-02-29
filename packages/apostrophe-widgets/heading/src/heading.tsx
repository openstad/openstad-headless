import React from 'react';
import { createRoot } from 'react-dom/client';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading1, Heading2, Heading3, Heading4, } from "@utrecht/component-library-react";

interface Item {
  mode: string, 
  title: string, 
  customClass?: string
}

function Heading ({ mode, title, customClass }: Item ) {
  if (mode === 'h1') {
    return <Heading1 className={customClass}>{title}</Heading1>;
  } else if (mode === 'h2') {
    return <Heading2 className={customClass}>{title}</Heading2>;
  } else if (mode === 'h3') {
    return <Heading3 className={customClass}>{title}</Heading3>;
  } else if (mode === 'h4') {
    return <Heading4 className={customClass}>{title}</Heading4>;
  }
};

Heading.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
};

export { Heading };