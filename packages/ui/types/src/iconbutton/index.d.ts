import React from 'react';
import '../index.css';
import './index.css';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string;
    text?: string;
    iconOnly?: boolean;
};
export declare const IconButton: React.ForwardRefExoticComponent<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: string;
    text?: string;
    iconOnly?: boolean;
} & React.RefAttributes<HTMLButtonElement>>;
