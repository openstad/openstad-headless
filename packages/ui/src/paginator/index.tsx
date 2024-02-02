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
  const pages = [...Array(totalPages).keys()];

  return (
    <div className="osc-paginator">
      <IconButton
        icon="ri-arrow-left-s-line"
        className="secondary round"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}></IconButton>

      {pages.map((pageNr) => (
        <IconButton
          className="secondary round"
          onClick={() => onPageChange(pageNr)}
          disabled={pageNr === page}>
          {pageNr + 1}
        </IconButton>
      ))}

      <IconButton
        icon="ri-arrow-right-s-line"
        className="secondary round"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages -1}></IconButton>
    </div>
  );
};

export { Paginator };
