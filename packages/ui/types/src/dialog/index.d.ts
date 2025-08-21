import * as RadixDialog from '@radix-ui/react-dialog';
import '../index.css';
import './index.css';
import React, { PropsWithChildren } from 'react';
export declare const Dialog: ({ children, open, onOpenChange, className, ...props }: PropsWithChildren<RadixDialog.DialogProps & {
    className?: string;
}>) => React.JSX.Element;
