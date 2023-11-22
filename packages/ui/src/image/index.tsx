import React, { ReactNode } from 'react';

import '../index.css';
import './index.css';

export function Image({
  imageFooter,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { imageFooter?: ReactNode }) {
  return (
    <figure
      onClick={props.onClick}
      className={`image-container ${props.className}`}>
      <img alt={props.alt} {...props} />
      <figcaption className="image-footer">{imageFooter}</figcaption>
    </figure>
  );
}
