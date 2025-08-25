import React from 'react';
import '../index.css';
import './index.css';
declare const Paginator: ({ page, totalPages, onPageChange, }: React.HTMLAttributes<HTMLDivElement> & {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) => React.JSX.Element;
export { Paginator };
