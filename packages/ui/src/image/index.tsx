import React, { ReactNode } from 'react';

import '../index.css';
import './index.css';

export function Image({
  imageFooter,
  imageHeader,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  imageFooter?: ReactNode;
  imageHeader?: ReactNode;
}) {
  return (
    <figure
      onClick={props.onClick}
      className={`image-container ${props.className}`}>
      {imageHeader ? (
        <div className="osc-image-header">{imageHeader}</div>
      ) : null}
      {/* ponytail: role=presentation alleen als er geen alt is; anders werd een
          meegegeven alt door de vaste presentation-rol genegeerd (WCAG 1.1.1) */}
      <img
        {...props}
        alt={props.alt ? props.alt : ''}
        role={props.alt ? props.role : 'presentation'}
      />
      {imageFooter && (
        <figcaption className="osc-image-footer">{imageFooter}</figcaption>
      )}
    </figure>
  );
}
