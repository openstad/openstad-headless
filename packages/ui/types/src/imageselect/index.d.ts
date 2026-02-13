import React from 'react';

import '../index.css';
import './index.css';

export declare const ImageSelect: React.ForwardRefExoticComponent<
  {
    onValueChange?: (resource: any) => void;
    images: Array<string>;
    items: Array<{
      key: string;
      text: string;
    }>;
  } & React.SelectHTMLAttributes<HTMLInputElement> &
    React.RefAttributes<HTMLInputElement>
>;
