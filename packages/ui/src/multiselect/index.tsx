import React, { useState, useEffect, useRef } from 'react';
// import { Checkbox } from '../checkbox';
import { Icon } from '../icon';
import './index.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button, Checkbox, FormLabel, Paragraph, FormField } from "@utrecht/component-library-react";

export function MultiSelect({
  label,
  onItemSelected,
  defaultOpen,
  options,
}: {
  label: string;
  options: Array<{ value: string; label: string; checked?: boolean }>;
  defaultOpen?: boolean;
  id?: string;
  onItemSelected: (optionValue: string, optionLabel?: string) => void;
}) {

  const [isOpen, setOpen] = useState<boolean>(defaultOpen || false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="multi-select" ref={containerRef}>
      <Button
        appearance='default-button'
        onClick={() => {
          setOpen(!isOpen);
        }}
      >
        {label}
        <Icon icon={isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
      </Button>

      {isOpen &&
        <section className="multiselect-container">
          {options.map((option, index) => {
            return (
              <div
                onClick={() => {
                  const value = option.value;
                  const label = option.label;
                  onItemSelected(value, label);
                }}
                key={`multi-select-item-${option.label}`}>
                <FormField type="checkbox">
                  <Paragraph className="utrecht-form-field__label utrecht-form-field__label--checkbox">
                    <Checkbox
                      className="utrecht-form-field__input"
                      checked={option.checked}
                    />
                    <FormLabel
                      type="checkbox"
                    >
                      {option.label}
                    </FormLabel>

                  </Paragraph>
                </FormField>
              </div>
            );
          })}
        </section>
      }
    </div>
  );
}
