import React, { ReactNode } from 'react';
import '../index.css';
import './index.css';
export type FocalPoint = {
    x: number;
    y: number;
};
export declare function focalPointStyle(fp?: FocalPoint | null): React.CSSProperties | undefined;
export declare function Image({ imageFooter, imageHeader, cornerBadge, href, linkLabel, focalPoint, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & {
    imageFooter?: ReactNode;
    imageHeader?: ReactNode;
    cornerBadge?: ReactNode;
    href?: string;
    linkLabel?: string;
    focalPoint?: FocalPoint | null;
}): React.JSX.Element;
