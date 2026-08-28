import React from 'react';
import './index.css';
declare const RangeSlider: React.ForwardRefExoticComponent<{
    onValueChange?: (value: string) => void;
    initialvalue: string;
    min: string;
    max: string;
    step: string;
    labels?: Array<string | React.JSX.Element>;
} & React.SelectHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export { RangeSlider };
