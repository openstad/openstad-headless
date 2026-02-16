import React, { ReactNode } from 'react';

import '../index.css';
import './index.css';

export declare function Image({
  imageFooter,
  imageHeader,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  imageFooter?: ReactNode;
  imageHeader?: ReactNode;
}): React.JSX.Element;
