import React from 'react';
import '../index.css';
import './index.css';
import { Icon } from '../icon';

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`osc-icon-button ${props.className}`}>
        {props.icon ? <Icon icon={props.icon} /> : null}
        {props.children}
      </button>
    );
  }
);
