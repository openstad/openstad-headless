import React from 'react';
import './index.css';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
export declare function MultiSelect({ label, onItemSelected, defaultOpen, options, }: {
    label: string;
    options: Array<{
        value: string;
        label: string;
        checked?: boolean;
    }>;
    defaultOpen?: boolean;
    id?: string;
    onItemSelected: (optionValue: string, optionLabel?: string) => void;
}): React.JSX.Element;
