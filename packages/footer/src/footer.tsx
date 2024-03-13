import React from 'react';
import { createRoot } from 'react-dom/client';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading, Link } from "@utrecht/component-library-react";
import './footer.css';

interface Item {
  content: string;
};

function Footer({ content }: Item) {
  return (
    <footer>
      <div className="container">
        {JSON.parse(content).map((section: any, index: number) => (
          <div key={index} className="footer-section">
            <Heading level={2} appearance="utrecht-heading-4">{section.title}</Heading>
            <ul>
              {section.items.map((item: any, index: number) => (
                <li key={index}>
                  <Link href={item.url}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
