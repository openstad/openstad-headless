import { Link } from '@utrecht/component-library-react';
import React, { useEffect, useRef } from 'react';

import './navBar.css';

interface Item {
  index?: number;
  item: any;
  prefix?: string;
  open: boolean;
  setOpenIndex: (index: any) => void;
}

function MenuItem({ item, index, prefix = '', open, setOpenIndex }: Item) {
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const handleClickOutside = (event: MouseEvent) => {
    if (!openRef.current) return;
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpenIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(event.relatedTarget as Node)) {
      setOpenIndex(null);
    }
  };

  // ponytail: Escape sluit het submenu en zet focus terug op de chevron-knop (WCAG 1.4.13)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && openRef.current) {
      setOpenIndex(null);
      buttonRef.current?.focus();
    }
  };

  const getCurrentPage = (e: string) => {
    return window.location.href.includes(e.replaceAll(' ', '-'))
      ? 'page'
      : undefined;
  };

  return (
    <div
      key={index}
      className="item-container"
      onMouseEnter={() => setOpenIndex(index)}
      onKeyDown={handleKeyDown}>
      <Link
        className="level-1"
        href={`${prefix}${item.slug}`}
        aria-current={getCurrentPage(item.title)}>
        {item.title}
      </Link>
      {item._children.length > 0 && (
        <>
          <button
            ref={buttonRef}
            className="toggle-submenu"
            // ponytail: togglen (openen én sluiten), niet alleen openen (WCAG 2.4.4)
            onClick={() => {
              setOpenIndex(open ? null : index);
            }}
            aria-expanded={open}
            aria-controls={`submenu-${index}`}>
            <i className="ri-arrow-down-s-line"></i>
            <span className="sr-only">
              {open
                ? "Verberg onderliggende pagina's"
                : "Toon onderliggende pagina's"}
            </span>
          </button>
          <div
            className="submenu"
            id={`submenu-${index}`}
            hidden={!open}
            onMouseLeave={() => setOpenIndex(null)}
            onBlur={handleBlur}
            tabIndex={-1}
            ref={ref}>
            {/* ponytail: echte lijst zodat hulpsoftware het aantal items voorleest (WCAG 1.3.1) */}
            <ul className="submenu-list">
              {item._children &&
                item._children.map((child: any, childIndex: number) => (
                  <li key={`${index}-${childIndex}`}>
                    <Link
                      className="level-2"
                      href={`${prefix}${child.slug}`}
                      aria-current={getCurrentPage(child.title)}>
                      {child.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export { MenuItem };
