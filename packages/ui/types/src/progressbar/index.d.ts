import React from 'react';

import '../index.css';
import './index.css';

declare const ProgressBar: (
  props: React.HTMLAttributes<HTMLDivElement> & {
    progress: number;
  }
) => React.JSX.Element;
export { ProgressBar };
