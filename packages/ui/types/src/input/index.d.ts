import '../index.css';
import './index.css';
import React from 'react';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
declare const Input: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & {
    errors?: string;
    info?: string;
    label?: string;
} & React.RefAttributes<HTMLInputElement>>;
export { Input };
