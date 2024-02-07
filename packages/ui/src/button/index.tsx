import React from 'react';

import '../index.css';
import './index.css';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  iconBack?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <button ref={ref} {...props} className={`osc-button ${props.className}`}>
        {props.icon && !props.iconBack ? <i className={props.icon}></i> : null}
        {props.children}
        {props.icon && props.iconBack ? <i className={props.icon}></i> : null}
      </button>
    );
  }
);

export const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <Button ref={ref} {...props} className={`osc-secondary ${props.className}`} />
    );
  }
);

export const GhostButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <Button ref={ref} {...props} className={`ghost ${props.className}`} />
    );
  }
);

export const PlainButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <Button ref={ref} {...props} className={`osc-plain ${props.className}`} />
    );
  }
);