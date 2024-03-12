import React from 'react';
import { createRoot } from 'react-dom/client';

import "./alert-box.css";

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Alert, Paragraph } from "@utrecht/component-library-react";

interface Item {
  content: string;
}

function AlertBox ({ content }: Item ) {
  return (
    <Alert className="alert-box">
      <div className="icon"></div>
      <Paragraph>{content}</Paragraph>
    </Alert>
  );

};

AlertBox.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
};

export { AlertBox };