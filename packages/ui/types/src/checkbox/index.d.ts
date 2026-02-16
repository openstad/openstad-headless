import React from 'react';

import '../index.css';
import './index.css';

type Props = {
  checked?: boolean;
  iconVariant?: 'small';
} & React.HTMLAttributes<HTMLDivElement>;
export declare function Checkbox({
  checked,
  iconVariant,
  ...props
}: Props): React.JSX.Element;
export {};
