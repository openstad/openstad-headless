import React, { ReactNode } from 'react';
import './index.css';
type ClickableImageProps = {
    /** Whether the image can be enlarged. When false the children render unchanged. */
    clickable?: boolean;
    /** Source of the image shown in the lightbox (usually the full-size image). */
    src: string;
    /** Alt text used in the lightbox. */
    alt?: string;
    /**
     * `wrapper`: the whole image acts as the enlarge trigger (display-only images).
     * `overlay`: a small zoom button is placed over the image, so the image itself
     * can keep its own interaction (selection, swipe, …).
     */
    variant?: 'wrapper' | 'overlay';
    /** Accessible label for the enlarge action. */
    label?: string;
    /** The rendered image element to wrap. */
    children: ReactNode;
};
export declare const ClickableImage: ({ clickable, src, alt, variant, label, children, }: ClickableImageProps) => React.JSX.Element;
export {};
