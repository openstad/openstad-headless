import React from 'react';

import { Button, SecondaryButton } from '../button';
import { IconButton } from '../iconbutton';
import '../index.css';
import './index.css';

const Paginator = ({
  page,
  totalPages,
  visiblePages = 5,
  onPageChange,
}: React.HTMLAttributes<HTMLDivElement> & {
  page: number;
  totalPages: number;
  visiblePages?: number;
  onPageChange: (page: number) => void;
}) => {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= visiblePages) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
      return pages;
    }
    if (page < visiblePages - 2) {
      for (let i = 0; i < visiblePages - 2; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages - 1);
      return pages;
    }
    if (page >= totalPages - visiblePages + 1) {
      pages.push(0);
      pages.push('...');
      for (let i = totalPages - visiblePages; i < totalPages; i++)
        pages.push(i);
      return pages;
    }
    pages.push(0);
    pages.push('...');
    for (let i = page - 1; i <= page + visiblePages - 4; i++) pages.push(i);
    pages.push('...');
    pages.push(totalPages - 1);
    return pages;
  };

  const visible = getVisiblePages();

  return (
    <nav className="osc-paginator" aria-label="Paginering">
      <ul className="osc-paginator-list">
        <li>
          <IconButton
            icon="ri-arrow-left-s-line"
            className="secondary round"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            aria-label={`Vorige pagina${page === 0 ? ' (Niet beschikbaar)' : ''}`}
            iconOnly={true}
            test-id={'previous-page-button'}
          />
        </li>

        {visible.map((item, idx) =>
          item === '...' ? (
            <li key={`ellipsis-${idx}`} aria-hidden="true">
              <span className="osc-paginator-ellipsis">...</span>
            </li>
          ) : (
            <li key={`page-${item}`}>
              <IconButton
                className="secondary round"
                onClick={() => onPageChange(item as number)}
                disabled={item === page}
                test-id={`page-button-${item}`}
                aria-label={`Pagina ${(item as number) + 1}${
                  item === page ? ' (Huidige pagina)' : ''
                }`}
                aria-current={item === page ? 'page' : undefined}>
                {(item as number) + 1}
              </IconButton>
            </li>
          )
        )}

        <li>
          <IconButton
            icon="ri-arrow-right-s-line"
            className="secondary round"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label={`Volgende pagina${
              page >= totalPages - 1 ? ' (Niet beschikbaar)' : ''
            }`}
            iconOnly={true}
            test-id={'next-page-button'}
          />
        </li>
      </ul>
    </nav>
  );
};

export { Paginator };
