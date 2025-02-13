import React from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import './section.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Image, Heading3, Paragraph, Link, AccordionProvider } from "@utrecht/component-library-react";

interface Item {
  content: string;
  expandable: string;
  expandablelabel: string;
  expanded: string;
}

const renderCards = (items) => {
  return (
      <div className="icon-section-grid">
        <div className="container u-small-dropdowns">

          {items.map((item: any, index: number) => (
            <article className="icon-section-card" key={index}>
              {item.image &&
                <Image
                  alt={item.imageAlt}
                  height={item.image.height}
                  width={item.image.width}
                  src={item.image._urls.full}
                />
              }
              <div className="icon-section-content">
                {item.title &&
                  <Heading3>{item.title}</Heading3>
                }
                {item.description && 
                  <Paragraph>{item.description}</Paragraph>
                }
                {item.href && (
                  <div>
                    <Link href={item.href} target={( typeof(item.target) !== "undefined" && item.target === false) ? '_self' : '_blank'}>{item.linkText}</Link>
                  </div>
                )}
              </div>
            </article>
          ))}
          
        </div>
      </div>
  )
};

function IconSection({ content, expandable, expandablelabel, expanded }: Item) {
  const items = JSON.parse(content);
  const renderedCards = renderToString(renderCards(items));
  return (
    <section className="icon-section">
      {expandable === 'true' ? (
        <AccordionProvider
          sections={[
            {
              body: <div className="icon-section-container" dangerouslySetInnerHTML={{ __html: renderedCards }} />,
              expanded: expanded === 'true',
              headingLevel: 2,
              label: expandablelabel,
            }
        ]}
      />
      ) : (
        <div className="icon-section-container" dangerouslySetInnerHTML={{ __html: renderedCards }} />
      )}
    </section>
  );
}

IconSection.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }
};

export { IconSection };