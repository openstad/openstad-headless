import React from 'react';

import './index.css';

export declare function Icon({
  text,
  description,
  icon,
  variant,
  iconOnly,
}: {
  text?: string;
  icon: string;
  description?: string;
  variant?: 'small' | 'regular' | 'big';
  iconOnly?: boolean;
}): React.JSX.Element;
