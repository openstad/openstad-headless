import React from 'react';
import { createRoot } from 'react-dom/client';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading, Link, Paragraph } from "@utrecht/component-library-react";
import './footer.css';

interface Item {
  content: string;
  logo?: any;
  alt?: string;
};

function Footer({ content, logo, alt }: Item) {
  const hasValidLogo = logo && JSON.parse(logo)?._urls?.original;

  return (
    <footer>
      <div className="container">
        {JSON.parse(content).map((section: any, index: number) => (
          <div key={index} className="footer-section">
            {section?.title && (<Heading level={2} appearance="utrecht-heading-4">{section.title}</Heading>)}
            {section?.intro && (<Paragraph> {section.intro} </Paragraph>)}
            {(!!section.items && section.items.length > 0) && (
              <ul>
                {section.items.map((item: any, index: number) => (
                  <li key={index}>
                    <Link href={item.url}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {hasValidLogo &&
          <figure className="footer-logo">
            <img src={JSON.parse(logo)?._urls?.original} alt={alt || 'Afbeelding van het logo'} />
          </figure>
        }
      </div>
    </footer>
  )
}

Footer.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }

};

export { Footer };
