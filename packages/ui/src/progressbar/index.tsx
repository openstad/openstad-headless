import React from 'react';
import '../index.css';
import './index.css';

const ProgressBar = (
  props: React.HTMLAttributes<HTMLDivElement> & { progress: number }
) => {
  const { progress } = props;

  const fillerStyles = {
    width: `${progress}%`,
  };

  return (
    <div className="osc osc-progressbar">
      <div className="osc-progressbar-tracker" style={fillerStyles}></div>
    </div>
  );
};

export { ProgressBar };
