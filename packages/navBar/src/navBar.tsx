import React from 'react';
import { createRoot } from 'react-dom/client';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Link, Button } from "@utrecht/component-library-react";
import './navBar.css';

interface Item {
  home?: string;
  content: string;
};

function NavBar({ home, content }: Item) {

  return (
    <div className='container'>
        <nav id="main-menu">
          {home && (
            JSON.parse(home).map((item: any, index: number) => {
              return (
                <Link key={index} href={item._url} aria-current="page">{item.title}</Link>
              )
            })
          )}
          {JSON.parse(content).map((item: any, index: number) => {
            return (
              <Link key={index} href={item.slug} aria-current="page">{item.title}</Link>
            )
          })}
        </nav>
    </div>
  )
}

NavBar.loadWidgetOnElement = function (this: any, container: HTMLElement, props: any) {
  const Component = this;

  if (container) {
    const root = createRoot(container);
    root.render(<Component {...props} />);
  }

};

export { NavBar };
