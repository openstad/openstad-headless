import React from 'react';
import './index.css';
type LightboxProps = {
    src: string;
    alt?: string;
    onClose: () => void;
};
export declare const Lightbox: ({ src, alt, onClose }: LightboxProps) => React.JSX.Element;
export {};
