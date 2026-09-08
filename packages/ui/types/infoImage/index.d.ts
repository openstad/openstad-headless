import React from 'react';
import './index.css';
type ImageType = {
    url: string;
    imageAlt?: string;
    imageDescription?: string;
};
type InfoImageProps = {
    imageFallback?: string;
    imageAltFallback?: string;
    imageDescriptionFallback?: string;
    images?: ImageType[];
    createImageSlider?: boolean;
    addSpacer?: boolean;
    imageClickable?: boolean;
};
declare const InfoImage: ({ imageFallback, imageAltFallback, imageDescriptionFallback, images, createImageSlider, addSpacer, imageClickable, }: InfoImageProps) => React.JSX.Element;
export { InfoImage };
