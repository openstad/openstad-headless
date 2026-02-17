import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';
import { PropsWithChildren } from 'react';

import './index.css';

type Props = {
  items: Array<{
    label: string;
    onClick: () => void;
  }>;
};
export declare const DropDownMenu: ({
  children,
  items,
}: PropsWithChildren & Props) => React.JSX.Element;
export {};
