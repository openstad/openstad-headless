import React from 'react';

import '../index.css';
import './index.css';

const ProgressBar = (
  props: React.HTMLAttributes<HTMLDivElement> & {
    progress: number;
    'aria-label'?: string;
  }
) => {
  const { progress, 'aria-label': ariaLabel, ...rest } = props;

  return (
    <div className="progressbar">
      <progress
        className="progressbar-tracker"
        value={progress}
        max="100"
        aria-label={ariaLabel}
      />
    </div>
  );
};

export { ProgressBar };
