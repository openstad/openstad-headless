import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';
import '../index.css';
import './index.css';
declare const Input: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & {
    errors?: string;
    info?: string;
    label?: string;
} & React.RefAttributes<HTMLInputElement>>;
export { Input };
