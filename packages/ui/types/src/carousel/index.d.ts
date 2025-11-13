import React from 'react';

import '../index.css';
import './index.css';

type Props = {
  items: Array<any>;
  itemRenderer: (item: any) => React.JSX.Element;
  startIndex?: number;
  previousButton?: HTMLButtonElement;
  nextButton?: HTMLButtonElement;
  buttonText?: {
    next?: string;
    previous?: string;
  };
  beforeIndexChange?: () => void;
  setIndexInParent?: (setter: (index: number) => void) => void;
} & React.HTMLAttributes<HTMLDivElement>;
export declare function Carousel({
  startIndex,
  items,
  itemRenderer,
  buttonText,
  beforeIndexChange,
  setIndexInParent,
  ...props
}: Props): React.JSX.Element | null;
export {};
