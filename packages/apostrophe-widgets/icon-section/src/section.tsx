import '@utrecht/component-library-css';
import {
  AccordionProvider,
  Heading3,
  Image,
  Link,
  Paragraph,
} from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React, { useId } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import './section.css';

interface Item {
  content: string;
  expandable: string;
  expandablelabel: string;
  expanded: string;
}

const renderCards = (items, idPrefix: string) => {
  return (
    <div className="icon-section-grid">
      <ul className="container u-small-dropdowns icon-section-list" role="list">
        {items.map((item: any, index: number) => {
          // ponytail: prefix per widget-instance — meerdere icon-sections op één
          // pagina gaven anders allemaal dezelfde id's, waardoor aria-labelledby
          // naar de kop van de eerste sectie wees (WCAG 1.3.1)
          const headingId = `${idPrefix}-heading-${index}`;
          const isBlank =
            typeof item.target === 'undefined' || item.target !== false;
          const linkProps = item.href
            ? {
                href: item.href,
                target: isBlank ? '_blank' : '_self',
                ...(isBlank ? { rel: 'noopener noreferrer' } : {}),
              }
            : {};

          if (item.linkScreenReaderText) {
            linkProps['aria-label'] = item.linkScreenReaderText;
          } else if (item.title && item.linkText) {
            linkProps['aria-label'] = `${item.linkText} over ${item.title}`;
          }

          return (
            <li key={index}>
              <article
                className="icon-section-card"
                aria-labelledby={item.title ? headingId : undefined}>
                {item.image && (
                  <Image
                    alt={item.imageAlt || ''}
                    height={item.image.height}
                    width={item.image.width}
                    src={item.image._urls.full}
                  />
                )}
                <div className="icon-section-content">
                  {item.title && (
                    <Heading3 id={headingId}>{item.title}</Heading3>
                  )}
                  {item.description && (
                    <Paragraph>{item.description}</Paragraph>
                  )}
                  {item.href && (
                    <div>
                      <Link {...linkProps}>{item.linkText}</Link>
                    </div>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

function IconSection({ content, expandable, expandablelabel, expanded }: Item) {
  const idPrefix = useId();
  const items = JSON.parse(content);
  const renderedCards = renderToString(renderCards(items, idPrefix));
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

export { IconSection };
