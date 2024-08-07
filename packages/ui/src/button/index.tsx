import React from 'react';
import { Button as NldsButton} from '@utrecht/component-library-react';


import '../index.css';
import './index.css';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  iconBack?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <NldsButton ref={ref} {...props} appearance="primary-action-button" className={`${props.className}`}>
        {props.icon && !props.iconBack ? <i className={props.icon}></i> : null}
        {props.children}
        {props.icon && props.iconBack ? <i className={props.icon}></i> : null}
      </NldsButton>
    );
  }
);

export const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <NldsButton ref={ref} {...props}  appearance="secondary-action-button" className={`${props.className}`} />
    );
  }
);

export const GhostButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <NldsButton ref={ref} {...props} appearance="subtle-button" className={`${props.className}`} />
    );
  }
);

export const PlainButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <NldsButton ref={ref} {...props} appearance="primary-action-button" className={`${props.className}`} />
    );
  }
);