import '@utrecht/component-library-css';
import { Heading, Link, Paragraph } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

import './footer.css';

interface Item {
  content: string;
  logo?: any;
  alt?: string;
}

function parseJSON<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string' || value.trim() === '') return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function Footer({ content, logo = null, alt = '' }: Item) {
  const sections = parseJSON<any[]>(content, []);
  const parsedLogo = parseJSON<any>(logo, null);
  const logoUrl = parsedLogo?._urls?.original;

  return (
    <footer>
      <div className="container">
        {sections.map((section: any, sectionIndex: number) => (
          <div key={sectionIndex} className="footer-section">
            {section?.title && (
              <Heading level={2} appearance="utrecht-heading-4">
                {section.title}
              </Heading>
            )}
            {section?.intro && <Paragraph> {section.intro} </Paragraph>}
            {!!section.items && section.items.length > 0 && (
              <ul>
                {section.items.map((item: any, itemIndex: number) => (
                  <li key={itemIndex}>
                    <Link href={item.url}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {logoUrl && (
          <figure className="footer-logo">
            <img src={logoUrl} alt={alt || 'Afbeelding van het logo'} />
          </figure>
        )}
      </div>
    </footer>
  );
}

Footer.loadWidgetOnElement = function (
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

export { Footer };
