import React, { ReactNode } from 'react';
import '../index.css';
import './index.css';
export declare function Image({ imageFooter, imageHeader, cornerBadge, href, linkLabel, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & {
    imageFooter?: ReactNode;
    imageHeader?: ReactNode;
    cornerBadge?: ReactNode;
    href?: string;
    linkLabel?: string;
}): React.JSX.Element;
