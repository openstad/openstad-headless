import * as RadixDialog from '@radix-ui/react-dialog';
import React, { PropsWithChildren } from 'react';

import '../index.css';
import './index.css';

export declare const Dialog: ({
  children,
  open,
  onOpenChange,
  className,
  ...props
}: PropsWithChildren<
  RadixDialog.DialogProps & {
    className?: string;
  }
>) => React.JSX.Element;
