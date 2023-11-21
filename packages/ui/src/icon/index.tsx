import React from 'react';
import 'remixicon/fonts/remixicon.css';
import './index.css';

export function Icon({
  text,
  icon,
  variant = 'regular',
}: {
  text?: string;
  icon: string;
  variant?: 'small' | 'regular' | 'big';
}) {
  return (
    <div className={`osc osc-icon ${text === undefined ? 'no-label' : ''}`}>
      <i className={`${icon} ${variant}`}></i>
      <p>{text}</p>
    </div>
  );
}
