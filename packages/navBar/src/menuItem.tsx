import React, { useEffect, useRef } from 'react';
import { Link } from "@utrecht/component-library-react";
import './navBar.css';

interface Item {
  index?: number;
  item: any;
  prefix?: string;
  open: boolean;
  setOpenIndex: (index: any) => void;
};

function MenuItem({ item, index, prefix = '', open, setOpenIndex }: Item) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
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

  const getCurrentPage = (e: string) => {
    return window.location.href.includes(e.replaceAll(' ', '-')) ? 'page' : undefined;
  }


  return (
    <div
      key={index}
      className="item-container"
      onMouseEnter={() => setOpenIndex(index)}
    >
      <Link className="level-1" href={`${prefix}${item.slug}`} aria-current={getCurrentPage(item.title)}>{item.title}</Link>
      {item._children.length > 0 && (
        <>
          <button className="toggle-submenu" onClick={() => setOpenIndex(index)}>
            <i className="ri-arrow-down-s-line"></i>
            <span className="sr-only">Toon onderliggende pagina's</span>
          </button>
          {open && (
            <div className="submenu" onMouseLeave={() => setOpenIndex(null)} onBlur={handleBlur} tabIndex={-1} ref={ref}>
              {item._children && item._children.map((child: any, childIndex: number) => (
                <Link className="level-2" key={`${index}-${childIndex}`} href={`${prefix}${child.slug}`} aria-current={getCurrentPage(child.title)}>{child.title}</Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { MenuItem };