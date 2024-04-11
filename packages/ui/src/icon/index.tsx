import React from 'react';
import 'remixicon/fonts/remixicon.css';
import './index.css';

export function Icon({
  text,
  icon,
  variant = 'regular',
  iconOnly = false
}: {
  text?: string;
  icon: string;
  variant?: 'small' | 'regular' | 'big';
  iconOnly?: boolean;
}) {
  return (
    <div className={`icon ${text === undefined || iconOnly === true ? 'no-label' : ''}`}>
      <i className={`${icon} ${variant}`}></i>
      <p>{text}</p>
    </div>
  );
}
