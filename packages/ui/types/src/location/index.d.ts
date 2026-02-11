import React from 'react';
import './index.css';
import { PostcodeAutoFillLocation } from '../stem-begroot-and-resource-overview/filter';
type Props = {
    onValueChange: (location: PostcodeAutoFillLocation) => void;
    locationDefault: PostcodeAutoFillLocation;
    zipCodeAutofillApiUrl?: string;
    zipCodeApiUrl?: string;
    proximityOptions?: {
        label: string;
        value: string;
    }[];
    proximityDefault?: string;
};
export default function PostcodeAutoFill({ onValueChange, locationDefault, proximityOptions, ...props }: Props): React.JSX.Element;
export {};
