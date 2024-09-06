import React, { forwardRef } from 'react';
import './index.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Select as NLDS_Select, SelectOption } from "@utrecht/component-library-react";

type Props = {
  onValueChange?: (resource: any) => void;
  options?: Array<{ value: string; label: string }>;
  disableDefaultOption?: boolean;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ onValueChange, ...props }, ref) => {
    const selectOptions = props.options ?? [];
    const disableDefaultOption = props.disableDefaultOption || false;

    return (
      <NLDS_Select
        ref={ref}
        {...props}
        className={`select ${props.className}`}
        onChange={
          props.onChange ||
          ((e) => onValueChange && onValueChange(e.target.value))
        }>
        {props.children}

          {!disableDefaultOption && (
              <SelectOption className="select-item" value={''}>
                Selecteer optie
              </SelectOption>
          )}

        {selectOptions.map((option) => (
          <React.Fragment key={`select-item-${option.label}`}>
            <SelectOption className="select-item" value={option.value}>
              {option.label}
            </SelectOption>
          </React.Fragment>
        ))}
      </NLDS_Select>
    );
  }
);

export { Select };
