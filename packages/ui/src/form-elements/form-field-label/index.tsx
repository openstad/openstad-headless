import { clsx } from 'clsx';
import React, { HTMLAttributes } from 'react';

import './index.css';

export const FormFieldLabel = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      'utrecht-form-field__label',
      'osc-form-field-label',
      className
    )}
    {...props}
  />
);
