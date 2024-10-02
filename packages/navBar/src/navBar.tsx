import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Link } from "@utrecht/component-library-react";
import './navBar.css';
import { MenuItem } from './menuItem';
interface Item {
  home?: string;
  content: string;
  prefix?: string;
};

function NavBar({ home, content, prefix = '' }: Item) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const event = new Event('navBarLoaded');
    document.dispatchEvent(event);
  }, [])

  return (
    <div className='container'>
      <nav id="main-menu">
        {home && (
          JSON.parse(home).map((item: any, index: number) => {
            return (
              <div
                key={index}
                className="item-container"
              >
                <Link className="level-1" key={index} href={item._url} aria-current="page">{item.title}</Link>
              </div>
            )
          })
        )}
        {JSON.parse(content).map((item: any, index: number) => {
          return (
            <MenuItem
              key={index}
              item={item}
              index={index}
              prefix={prefix}
              open={openIndex === index}
              setOpenIndex={setOpenIndex}
            />
          );
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
