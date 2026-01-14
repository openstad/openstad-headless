import React from 'react';
import './index.css';

export function Icon({
  text,
  description,
  icon,
  variant = 'regular',
  iconOnly = false,
  onClick = undefined,
}: {
  text?: string;
  icon: string;
  description?: string;
  variant?: 'small' | 'regular' | 'big';
  iconOnly?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`icon ${text === undefined || iconOnly === true ? 'no-label' : ''}`}
      aria-hidden={iconOnly ? "true" : "false"}
      onClick={onClick}
      data-description={description ? description : undefined}
    >
      <i className={`${icon} ${variant}`}></i>
      <p>{description ? <span className='sr-only'>{description}</span>: null}{text}</p>
    </div>
  );
}
