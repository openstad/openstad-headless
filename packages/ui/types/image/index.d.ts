import React, { ReactNode } from 'react';
import '../index.css';
import './index.css';
export declare function Image({ imageFooter, imageHeader, href, linkLabel, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & {
    imageFooter?: ReactNode;
    imageHeader?: ReactNode;
    href?: string;
    linkLabel?: string;
}): React.JSX.Element;
