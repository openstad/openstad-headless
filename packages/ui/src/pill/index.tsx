import React from 'react';

import './index.css';

export const Pill = ({
  text,
  rounded,
  light,
}: {
  text: string;
  rounded?: boolean;
  light?: boolean;
}) => {
  return (
    <div
      className={`osc-pill ${rounded && 'osc-pill-rounded'} ${
        light && 'osc-pill-light'
      }`}
      data-text={text?.toLowerCase() || ''}>
      <p>{text}</p>
    </div>
  );
};
