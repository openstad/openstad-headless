import React, { useEffect, useState } from 'react';
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
  const [mobile, setMobile] = useState(false);
  const [menuVisible, setMenuvisible] = useState(true);


  useEffect(() => {
    const mainMenu = document.getElementById('main-menu');
    const navBar = document.getElementById('navbar');

    if (mainMenu && navBar) {
      if (mainMenu.offsetWidth >= navBar.offsetWidth) {
        setMobile(true);
        setMenuvisible(false);
      } else {
        setMobile(false);
        setMenuvisible(true);
      }
    }
  }, []);


  return (
    <div className='container'>
      {mobile && (
        <Button
          appearance="primary-action-button"
          onClick={() => setMenuvisible(!menuVisible)}>
          Menu
        </Button>
      )}
      {menuVisible && (
        <nav id="main-menu" className={mobile ? 'mobile-nav' : undefined}>
          {mobile && (
            <Button
              appearance="primary-action-button"
              onClick={() => setMenuvisible(!menuVisible)}>
              Close
            </Button>
          )}
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
      )}
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
