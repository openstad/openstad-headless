import React, { ReactNode } from 'react';

import '../index.css';
import './index.css';

export function Image({
  imageFooter,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { imageFooter?: ReactNode }) {
  return (
    <div
      onClick={props.onClick}
      className={`osc osc-image-container ${props.className}`}>
      <img alt={props.alt} {...props} />
      <div className="osc-image-footer">{imageFooter}</div>
    </div>
  );
}
