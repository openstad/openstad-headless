import React from 'react';
import '../index.css';
import './index.css';
import { Button, SecondaryButton } from '../button';
import { IconButton } from '../iconbutton';

const Paginator = ({
  page,
  totalPages,
  onPageChange,
}: React.HTMLAttributes<HTMLDivElement> & {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index);

  return (
    <nav className="osc-paginator" aria-label="Paginering">
      <IconButton
        icon="ri-arrow-left-s-line"
        className="secondary round"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label={`Vorige pagina${page === 0 ? ' (Niet beschikbaar)' : ''}`}
        iconOnly={true}
        test-id={"previous-page-button"}
      >

      </IconButton>

      {pages.map((pageNr) => (
        <IconButton
          className="secondary round"
          onClick={() => onPageChange(pageNr)}
          disabled={pageNr === page}
          test-id={`page-button-${pageNr}`}
          aria-label={`Pagina ${pageNr + 1}${pageNr === page ? ' (Huidige pagina)' : ''}`}
          aria-current={pageNr === page ? "page" : undefined}
        >
          {pageNr + 1}
        </IconButton>
      ))}

      <IconButton
        icon="ri-arrow-right-s-line"
        className="secondary round"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label={`Volgende pagina${page >= totalPages - 1 ? ' (Niet beschikbaar)' : ''}`}
        iconOnly={true}
        test-id={"next-page-button"}
      ></IconButton>
    </nav>
  );
};

export { Paginator };
