import React from 'react';
import './index.css';
import { PostcodeAutoFillLocation } from '../stem-begroot-and-resource-overview/filter';
type Props = {
    onValueChange: (location: PostcodeAutoFillLocation) => void;
    locationDefault: PostcodeAutoFillLocation;
    zipCodeAutofillApiUrl?: string;
    zipCodeApiUrl?: string;
};
export default function PostcodeAutoFill({ onValueChange, locationDefault, ...props }: Props): React.JSX.Element;
export {};
