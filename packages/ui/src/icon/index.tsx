import React from 'react';
import 'remixicon/fonts/remixicon.css';
import './index.css';

export function Icon({
  text,
  description,
  icon,
  variant = 'regular',
  iconOnly = false
}: {
  text?: string;
  icon: string;
  description?: string;
  variant?: 'small' | 'regular' | 'big';
  iconOnly?: boolean;
}) {
  return (
    <div className={`icon ${text === undefined || iconOnly === true ? 'no-label' : ''}`}>
      <i className={`${icon} ${variant}`}></i>
      <p>{description ? <span className='sr-only'>{description}</span>: null}{text}</p>
    </div>
  );
}
