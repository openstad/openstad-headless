import React, { forwardRef } from 'react';
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
        className={`select ${props.className}`}
        onChange={props.onChange || ((e) => onValueChange && onValueChange(e.target.value))}>
        {props.children}

        {selectOptions.map((option) => (
          <React.Fragment key={`select-item-${option.label}`}>
            <option className="select-item" value={option.value}>
              {option.label}
            </option>
          </React.Fragment>
        ))}
      </select>
    );
  }
);

export { Select };
