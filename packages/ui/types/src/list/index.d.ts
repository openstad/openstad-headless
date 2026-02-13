import React from 'react';

import '../index.css';
import './index.css';

type Props<T> = {
  items: Array<T>;
  renderHeader?: () => React.JSX.Element;
  renderItem: (item: T, index: number) => React.JSX.Element;
  columns?: number;
  emptyListText?: string;
} & React.HTMLAttributes<HTMLDivElement>;
export declare const List: <
  T extends {
    [key: string]: any;
  },
>({
  items,
  renderItem,
  renderHeader,
  columns,
  emptyListText,
  ...props
}: Props<T>) => React.JSX.Element;
export {};
