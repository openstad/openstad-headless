import React from 'react';

import './index.css';

export const Pill = ({
  text,
  rounded,
  light,
  role,
}: {
  text: string;
  rounded?: boolean;
  light?: boolean;
  role?: string;
}) => {
  return (
    <div
      className={`osc-pill ${rounded && 'osc-pill-rounded'} ${
        light && 'osc-pill-light'
      }`}
      role={role}
      data-text={text?.toLowerCase() || ''}>
      <p>{text}</p>
    </div>
  );
};
