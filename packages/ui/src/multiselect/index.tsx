import React, { useState, useEffect, useRef } from 'react';
// import { Checkbox } from '../checkbox';
import { Icon } from '../icon';
import './index.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button, Checkbox, FormLabel, Paragraph, FormField } from "@utrecht/component-library-react";

export function MultiSelect({
  label = 'Selecteer optie',
  onItemSelected,
  defaultOpen,
  options,
  inlineOptions = false,
  id
}: {
  label?: string;
  options: Array<{ value: string; label: string; checked?: boolean }>;
  defaultOpen?: boolean;
  id: string;
  onItemSelected: (optionValue: string, optionLabel?: string) => void;
  inlineOptions?: boolean;
}) {

  const [isOpen, setOpen] = useState<boolean>(defaultOpen || false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ( inlineOptions ) return;

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

  const checkedOptions = options?.filter(option => option.checked) || [];
  let openButtonLabel = label;
  if (checkedOptions.length > 1) {
    openButtonLabel = `${checkedOptions.length} optie${checkedOptions.length !== 1 ? 's' : ''} geselecteerd`;
  } else if (checkedOptions.length === 1) {
    openButtonLabel = checkedOptions[0].label;
  }

  return (
    <div className={`multi-select ${inlineOptions ? 'multiselect-container--inline' : ''}`} ref={containerRef}>
      { !inlineOptions && (
        <Button
          appearance='default-button'
          onClick={() => {
            setOpen(!isOpen);
          }}
          test-id="multi-select-button"
          aria-labelledby={id}
          aria-expanded={isOpen}
          role="combobox"
          aria-haspopup="listbox"
        >
          {openButtonLabel}
          <Icon icon={isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
        </Button>
      )}

      {isOpen &&
        <section
          className={`multiselect-container ${inlineOptions ? 'multiselect-container--inline' : ''}`}
          role="listbox"
          aria-multiselectable="true"
        >
          {options?.map((option, index) => {
            return (
              <div
                role="option"
                aria-selected={option.checked}
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
