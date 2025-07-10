import React from 'react';
import './index.css';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
declare const Select: React.ForwardRefExoticComponent<{
    onValueChange?: (resource: any) => void;
    options?: Array<{
        value: string;
        label: string;
    }>;
    disableDefaultOption?: boolean;
} & React.SelectHTMLAttributes<HTMLSelectElement> & React.RefAttributes<HTMLSelectElement>>;
export { Select };
