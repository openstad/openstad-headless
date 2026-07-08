import React, { useCallback, useEffect, useRef, useState } from 'react';

import { IconButton } from '../iconbutton';
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
  pager?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  fade?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function Carousel({
  startIndex = 0,
  items = [],
  itemRenderer,
  buttonText,
  beforeIndexChange = () => {},
  setIndexInParent = () => {},
  pager = false,
  autoplay = false,
  autoplayInterval = 5000,
  fade = false,
  ...props
}: Props) {
  const [index, setIndex] = useState<number>(startIndex);
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
  const autoplayPaused = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(index);
  indexRef.current = index;

  const handleIndexChange = useCallback(
    (newIndex: number) => {
      if (beforeIndexChange) beforeIndexChange();

      setLeavingIndex(indexRef.current);
      setIndex(newIndex);

      setTimeout(() => {
        setLeavingIndex(null);
      }, 600);
    },
    [beforeIndexChange]
  );

  useEffect(() => {
    if (setIndexInParent) {
      setIndexInParent(() => setIndex);
    }
  }, [setIndexInParent]);

  useEffect(() => {
    if (!autoplay || items.length <= 1) return;

    timerRef.current = setInterval(() => {
      if (!autoplayPaused.current) {
        const next =
          indexRef.current >= items.length - 1 ? 0 : indexRef.current + 1;
        handleIndexChange(next);
      }
    }, autoplayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay, autoplayInterval, items.length, handleIndexChange]);

  if (items.length === 0) return null;

  return (
    <div
      {...props}
      className={`osc ${props.className} osc-carousel width-100`}
      onMouseEnter={
        autoplay
          ? () => {
              autoplayPaused.current = true;
            }
          : undefined
      }
      onMouseLeave={
        autoplay
          ? () => {
              autoplayPaused.current = false;
            }
          : undefined
      }>
      {items.length > 1 && (
        <div className="carousel-button-container">
          <div className="osc-carousel-navigation-button-wrapper osc-carousel-previous">
            <IconButton
              className="primary-action-button"
              icon="ri-arrow-left-s-line"
              disabled={index === 0}
              text={buttonText?.previous || 'Vorige slide'}
              iconOnly={true}
              onClick={() => handleIndexChange(index - 1)}
            />
          </div>
          <div className="osc-carousel-navigation-button-wrapper osc-carousel-next">
            <IconButton
              className="primary-action-button"
              icon="ri-arrow-right-s-line"
              disabled={index === items.length - 1}
              text={buttonText?.next || 'Volgende slide'}
              iconOnly={true}
              onClick={() => handleIndexChange(index + 1)}
            />
          </div>
        </div>
      )}

      <div className="carousel-items">
        {/* Nieuwe afbeelding — in normale flow, bepaalt de hoogte */}
        <div
          className={`carousel-item${fade && leavingIndex !== null ? ' carousel-item--entering' : ''}`}>
          {itemRenderer(items.at(index))}
        </div>
        {/* Oude afbeelding — absoluut bovenop, fadet weg */}
        {fade && leavingIndex !== null && (
          <div
            key={leavingIndex}
            className="carousel-item carousel-item--leaving">
            {itemRenderer(items.at(leavingIndex))}
          </div>
        )}
      </div>

      {pager && items.length > 1 && (
        <div className="osc-carousel-pager">
          {items.map((_, id) => (
            <button
              key={`osc-carousel-pager-button-${id}`}
              className={`osc-carousel-pager-button ${
                id === index ? 'active' : ''
              }`}
              onClick={() => handleIndexChange(id)}
              aria-label={`Ga naar slide ${id + 1}`}
              type="button"></button>
          ))}
        </div>
      )}
    </div>
  );
}
