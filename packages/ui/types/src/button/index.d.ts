import React from 'react';

import '../index.css';
import './index.css';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  iconBack?: boolean;
};
export declare const Button: React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string;
    iconBack?: boolean;
  } & React.RefAttributes<HTMLButtonElement>
>;
export declare const SecondaryButton: React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string;
    iconBack?: boolean;
  } & React.RefAttributes<HTMLButtonElement>
>;
export declare const GhostButton: React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string;
    iconBack?: boolean;
  } & React.RefAttributes<HTMLButtonElement>
>;
export declare const PlainButton: React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string;
    iconBack?: boolean;
  } & React.RefAttributes<HTMLButtonElement>
>;
