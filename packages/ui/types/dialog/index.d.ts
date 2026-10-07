import * as RadixDialog from '@radix-ui/react-dialog';
import React, { PropsWithChildren } from 'react';
import '../index.css';
import './index.css';
export declare const Dialog: ({ children, open, onOpenChange, className, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }: PropsWithChildren<RadixDialog.DialogProps & {
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
}>) => React.JSX.Element;
