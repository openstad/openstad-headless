import React from 'react';
import '../index.css';
import './index.css';
import { Button, SecondaryButton } from '../button';
import { IconButton } from '../iconbutton';

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
      for (let i = totalPages - visiblePages; i < totalPages; i++) pages.push(i);
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
    <div className="osc-paginator">
      <IconButton
        icon="ri-arrow-left-s-line"
        className="secondary round"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        text="Vorige pagina"
        iconOnly={true}
        test-id={"previous-page-button"}
      />

      {visible.map((item, idx) =>
        item === '...' ? (
          <span key={`ellipsis-${idx}`} className="osc-paginator-ellipsis">...</span>
        ) : (
          <IconButton
            key={`page-${item}`}
            className="secondary round"
            onClick={() => onPageChange(item as number)}
            disabled={item === page}
            test-id={`page-button-${item}`}
          >
            {(item as number) + 1}
          </IconButton>
        )
      )}

      <IconButton
        icon="ri-arrow-right-s-line"
        className="secondary round"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        text="Volgende pagina"
        iconOnly={true}
        test-id={"next-page-button"}
      />
    </div>
  );
};

export { Paginator };
