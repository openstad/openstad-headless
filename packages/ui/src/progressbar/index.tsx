import React from 'react';
import '../index.css';
import './index.css';

const ProgressBar = (
  props: React.HTMLAttributes<HTMLDivElement> & { progress: number }
) => {
  const { progress } = props;

  return (
    <div className="progressbar">
      <progress className="progressbar-tracker" value={progress} max="100" />
    </div>
  );
};

export { ProgressBar };
