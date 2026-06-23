import React, { ReactNode, useState } from 'react';

import { Lightbox } from '../lightbox';
import './index.css';

type ClickableImageProps = {
  /** Whether the image can be enlarged. When false the children render unchanged. */
  clickable?: boolean;
  /** Source of the image shown in the lightbox (usually the full-size image). */
  src: string;
  /** Alt text used in the lightbox. */
  alt?: string;
  /**
   * `wrapper`: the whole image acts as the enlarge trigger (display-only images).
   * `overlay`: a small zoom button is placed over the image, so the image itself
   * can keep its own interaction (selection, swipe, …).
   */
  variant?: 'wrapper' | 'overlay';
  /** Accessible label for the enlarge action. */
  label?: string;
  /** The rendered image element to wrap. */
  children: ReactNode;
};

const ZoomIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const ClickableImage = ({
  clickable = false,
  src,
  alt = '',
  variant = 'wrapper',
  label = 'Afbeelding uitvergroot bekijken',
  children,
}: ClickableImageProps) => {
  const [open, setOpen] = useState(false);

  if (!clickable || !src) {
    return <>{children}</>;
  }

  const lightbox = open ? (
    <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />
  ) : null;

  if (variant === 'overlay') {
    return (
      <span className="osc-clickable-image osc-clickable-image--overlay">
        {children}
        <button
          type="button"
          className="osc-clickable-image-zoom"
          aria-label={label}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}>
          <ZoomIcon />
        </button>
        {lightbox}
      </span>
    );
  }

  return (
    <div
      className="osc-clickable-image osc-clickable-image--wrapper"
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
        }
      }}>
      {children}
      {lightbox}
    </div>
  );
};
