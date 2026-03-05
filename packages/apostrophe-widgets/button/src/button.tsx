import '@utrecht/component-library-css';
import { ButtonGroup, ButtonLink } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

import './button.css';

interface Item {
  direction: string;
  buttons: string;
  prefix?: string;
}

function applyPrefix(href: string, prefix: string): string {
  if (prefix && href && href.startsWith('/')) {
    return prefix + href;
  }
  return href;
}

const renderButtons = (buttons: string, prefix: string) => {
  return JSON.parse(buttons).map((element: any, index: number) => {
    const href = element.useSitePrefix
      ? applyPrefix(element.href, prefix)
      : element.href;

    return (
      <ButtonLink
        key={index}
        appearance={element.appearance}
        target={element.target}
        href={href}>
        {element.label}
      </ButtonLink>
    );
  });
};

function Button({ buttons, direction, prefix }: Item) {
  const sitePrefix = prefix || '';

  if (buttons.length > 1) {
    return (
      <ButtonGroup direction={direction}>
        {renderButtons(buttons, sitePrefix)}
      </ButtonGroup>
    );
  } else {
    return renderButtons(buttons, sitePrefix);
  }
}

Button.loadWidgetOnElement = function (
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

export { Button, applyPrefix };
