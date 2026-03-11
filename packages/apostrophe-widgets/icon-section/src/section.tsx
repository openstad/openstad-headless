import '@utrecht/component-library-css';
import {
  AccordionProvider,
  Heading3,
  Image,
  Link,
  Paragraph,
} from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import './section.css';

interface Item {
  content: string;
  expandable: string;
  expandablelabel: string;
  expanded: string;
  prefix?: string;
}

function applyPrefix(href: string, prefix: string): string {
  if (prefix && href && href.startsWith('/')) {
    return prefix + href;
  }
  return href;
}

const renderCards = (items: any[], prefix: string) => {
  return (
    <div className="icon-section-grid">
      <div className="container u-small-dropdowns">
        {items.map((item: any, index: number) => {
          const itemHref = item.useSitePrefix
            ? applyPrefix(item.href, prefix)
            : item.href;
          const linkProps = itemHref
            ? {
                href: itemHref,
                target:
                  typeof item.target !== 'undefined' && item.target === false
                    ? '_self'
                    : '_blank',
              }
            : {};

          if (item.linkScreenReaderText) {
            linkProps['aria-label'] = item.linkScreenReaderText;
          }

          return (
            <article className="icon-section-card" key={index}>
              {item.image && (
                <Image
                  alt={item.imageAlt}
                  height={item.image.height}
                  width={item.image.width}
                  src={item.image._urls.full}
                />
              )}
              <div className="icon-section-content">
                {item.title && <Heading3>{item.title}</Heading3>}
                {item.description && <Paragraph>{item.description}</Paragraph>}
                {itemHref && (
                  <div>
                    <Link {...linkProps}>{item.linkText}</Link>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

function IconSection({
  content,
  expandable,
  expandablelabel,
  expanded,
  prefix,
}: Item) {
  const sitePrefix = prefix || '';
  const items = JSON.parse(content);
  const renderedCards = renderToString(renderCards(items, sitePrefix));
  return (
    <section className="icon-section">
      {expandable === 'true' ? (
        <AccordionProvider
          sections={[
            {
              body: (
                <div
                  className="icon-section-container"
                  dangerouslySetInnerHTML={{ __html: renderedCards }}
                />
              ),
              expanded: expanded === 'true',
              headingLevel: 2,
              label: expandablelabel,
            },
          ]}
        />
      ) : (
        <div
          className="icon-section-container"
          dangerouslySetInnerHTML={{ __html: renderedCards }}
        />
      )}
    </section>
  );
}

IconSection.loadWidgetOnElement = function (
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

export { IconSection, applyPrefix };
