import { Link } from '@utrecht/component-library-react';
import React, { useEffect, useRef } from 'react';

import './navBar.css';

interface Item {
  index?: number;
  item: any;
  prefix?: string;
  open: boolean;
  setOpenIndex: (index: any) => void;
  parentBehavior?: string;
}

function MenuItem({
  item,
  index,
  prefix = '',
  open,
  setOpenIndex,
  parentBehavior,
}: Item) {
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

  useEffect(() => {
    if (!open) return;

    const handleDocumentEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenIndex(null);
      if (ref.current?.contains(document.activeElement)) {
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleDocumentEscape);
    return () => {
      document.removeEventListener('keydown', handleDocumentEscape);
    };
  }, [open]);

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(event.relatedTarget as Node)) {
      setOpenIndex(null);
    }
  };

  const getCurrentPage = (e: string) => {
    return window.location.href.includes(e.replaceAll(' ', '-'))
      ? 'page'
      : undefined;
  };

  const hasChildren = item._children.length > 0;
  const asButton = parentBehavior === 'button' && hasChildren;

  return (
    <div
      key={index}
      className="item-container"
      onMouseEnter={() => setOpenIndex(index)}>
      {asButton ? (
        <button
          ref={buttonRef}
          className="level-1 parent-button"
          onClick={() => {
            setOpenIndex(open ? null : index);
          }}
          aria-expanded={open}
          aria-controls={`submenu-${index}`}>
          {item.title}
          <i className="ri-arrow-down-s-line"></i>
        </button>
      ) : (
        <Link
          className="level-1"
          href={`${prefix}${item.slug}`}
          aria-current={getCurrentPage(item.title)}>
          {item.title}
        </Link>
      )}
      {hasChildren && (
        <>
          {!asButton && (
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
          )}
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
              {asButton && (
                <li>
                  <Link
                    className="level-2"
                    href={`${prefix}${item.slug}`}
                    aria-current={getCurrentPage(item.title)}>
                    {item.title}
                  </Link>
                </li>
              )}
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
