import React, { useState } from 'react';
import '../index.css';
import './index.css';
import { IconButton } from '../iconbutton';

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
    <div
      {...props}
      className={`osc ${props.className} osc-carousel`}
      style={{ width: '100%' }}>
      <div className="osc-carousel-navigation-button-wrapper osc-carousel-previous">
        <IconButton
          className="primary-action-button"
          icon="ri-arrow-left-s-line"
          disabled={index === 0}
          text={'Vorige slide'}
          iconOnly={true}
          onClick={() => setIndex(index - 1)}
        />
      </div>

      <div className="carousel-items">{itemRenderer(items.at(index))}</div>

      <div className="osc-carousel-navigation-button-wrapper osc-carousel-next">
        <IconButton
          className="primary-action-button"
          icon="ri-arrow-right-s-line"
          disabled={index === items.length - 1}
          text={'Volgende slide'}
          iconOnly={true}
          onClick={() => setIndex(index + 1)}
        />
      </div>
    </div>
  );
}
