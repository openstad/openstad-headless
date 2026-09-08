import React from 'react';
import '../index.css';
import './index.css';
declare const Paginator: ({ page, totalPages, visiblePages, onPageChange, }: React.HTMLAttributes<HTMLDivElement> & {
    page: number;
    totalPages: number;
    visiblePages?: number;
    onPageChange: (page: number) => void;
}) => React.JSX.Element;
export { Paginator };
