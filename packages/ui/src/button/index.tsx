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
      <button ref={ref} {...props} className={`osc ${props.className}`}>
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
      <Button ref={ref} {...props} className={`secondary ${props.className}`} />
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
