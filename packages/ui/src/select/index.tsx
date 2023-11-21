import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import './index.css';

type Props = {
  onValueChange?: (resource: any) => void;
  options?: Array<{ value: string; label: string }>;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ onValueChange, ...props }, ref) => {
    const selectOptions = props.options ?? [];

    return (
      <select
        ref={ref}
        {...props}
        className={`osc osc-select ${props.className}`}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}>
        {props.children}

        {selectOptions.map((option) => (
          <React.Fragment key={`select-item-${option.label}`}>
            <option className="osc-select-item" value={option.value}>
              {option.label}
            </option>
          </React.Fragment>
        ))}
      </select>
    );
  }
);

export { Select };
