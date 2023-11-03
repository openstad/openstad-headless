import React from 'react';

import '../index.css';
import './index.css';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  iconBack?: boolean;
};

export function Button(props: ButtonProps) {
  return (
    <button className={`${props.className}`} {...props}>
      {props.icon && !props.iconBack ? <i className={props.icon}></i> : null}
      {props.children}
      {props.icon && props.iconBack ? <i className={props.icon}></i> : null}
    </button>
  );
}

export function GhostButton(props: ButtonProps) {
  return <Button className={`ghost ${props.className}`} {...props} />;
}
