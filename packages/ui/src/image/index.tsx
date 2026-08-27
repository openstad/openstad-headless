import React, { ReactNode } from 'react';

import '../index.css';
import './index.css';

export function Image({
  imageFooter,
  imageHeader,
  cornerBadge,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  imageFooter?: ReactNode;
  imageHeader?: ReactNode;
  cornerBadge?: ReactNode;
}) {
  return (
    <figure
      onClick={props.onClick}
      className={`image-container ${props.className}`}>
      {imageHeader ? (
        <div className="osc-image-header">{imageHeader}</div>
      ) : null}
      <div className="osc-image-frame">
        <img role="presentation" {...props} alt={props.alt ? props.alt : ''} />
        {cornerBadge}
      </div>
      {imageFooter && (
        <figcaption className="osc-image-footer">{imageFooter}</figcaption>
      )}
    </figure>
  );
}
