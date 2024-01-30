import React, { useState } from 'react';
import '../index.css';
import './index.css';
import { Icon } from '../icon';

type Props = {
  items: Array<any>;
  itemRenderer: (item: any) => React.JSX.Element;
  startIndex?: number;
  previousButton?: HTMLButtonElement;
  nextButton?: HTMLButtonElement;
} & React.HTMLAttributes<HTMLDivElement>;

export function Carousel({
  startIndex = 0,
  items = [],
  itemRenderer,
  ...props
}: Props) {
  const [index, setIndex] = useState<number>(startIndex);

  if (items.length === 0) return null;

  return (
    <div {...props} className={`osc ${props.className} osc-carousel`}>
      <button disabled={index === 0} onClick={() => setIndex(index - 1)}>
        Vorige
      </button>
      <div>{itemRenderer(items.at(index))}</div>
      <button
        disabled={index === items.length - 1}
        onClick={() => setIndex(index + 1)}>
        Volgende
      </button>
    </div>
  );
}
