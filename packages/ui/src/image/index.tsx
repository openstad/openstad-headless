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
      {imageHeader?<div className='osc-image-header'>{imageHeader}</div> :null}
      <img alt={props.alt} {...props} />
      <figcaption className="osc-image-footer">{imageFooter}</figcaption>
    </figure>
  );
}
