import React, { useState } from 'react';
import './index.css';

type Props = {
  onValueChange?: (resource: any) => void;
  options?: Array<{ value: string; label: string }>;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ onValueChange, ...props }: Props) {
  const selectOptions = props.options ?? [];

  return (
    <select
      {...props}
      className={`osc-2-select ${props.className}`}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}>
      {props.children}

      {selectOptions.map((option) => (
        <React.Fragment key={`select-item-${option.label}`}>
          <option className="ocs-2-select-item" value={option.value}>
            {option.label}
          </option>
        </React.Fragment>
      ))}
    </select>
  );
}
