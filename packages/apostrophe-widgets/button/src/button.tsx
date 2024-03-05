import React from 'react';
import { createRoot } from 'react-dom/client';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { ButtonLink, ButtonGroup } from "@utrecht/component-library-react";

interface Item {
  direction: string;
  buttons: any;
}

const renderButtons = (buttons: any) => {
  return JSON.parse(buttons).map((element: any, index) => {
    return <ButtonLink key={index} appearance={element.appearance} href={element.href}>{element.label}</ButtonLink>;
  });
}

function Button ({ buttons, direction }: Item ) {
  if(buttons.length > 1){
    return <ButtonGroup direction={direction}>{renderButtons(buttons)}</ButtonGroup>;
  }else{
    return renderButtons(buttons);
  }
};

Button.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
};

export { Button };