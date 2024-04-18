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

  const width = !props.height && !props.width ? '100%' : props.width;
  return (
    <figure
      style={{
        height: props.height,
        width,
      }}
      onClick={props.onClick}
      className={`image-container ${props.className}`}>
      {imageHeader ? (
        <div className="osc-image-header">{imageHeader}</div>
      ) : null}
      <img role="presentation" {...props} width={width} alt={props.alt} />
      <figcaption className="osc-image-footer">{imageFooter}</figcaption>
    </figure>
  );
}
