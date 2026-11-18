import '@utrecht/component-library-css';
import {
  Button,
  Checkbox,
  FormField,
  FormLabel,
  Paragraph,
} from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React, { useEffect, useRef, useState } from 'react';

// import { Checkbox } from '../checkbox';
import { Icon } from '../icon';
import './index.css';

export function MultiSelect({
  label = 'Selecteer optie',
  legend,
  onItemSelected,
  defaultOpen,
  options,
  inlineOptions = false,
  id,
}: {
  label?: string;
  legend: string;
  options: Array<{ value: string; label: string; checked?: boolean }>;
  defaultOpen?: boolean;
  id: string;
  onItemSelected: (optionValue: string, optionLabel?: string) => void;
  inlineOptions?: boolean;
}) {
  const [isOpen, setOpen] = useState<boolean>(defaultOpen || false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inlineOptions) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Closing with the mouse already worked, with the keyboard it didn't. The menu
  // stayed open when focus moved on to the next menu, overlapping it at 400%
  // zoom, and could not be closed itself (WCAG 1.4.10 / 2.1.1).
  const closeOnFocusLeave = (event: React.FocusEvent<HTMLDivElement>) => {
    if (inlineOptions) return;
    const next = event.relatedTarget as Node | null;
    // No relatedTarget = focus went nowhere, e.g. a click on an option (which
    // is not focusable itself). Don't close then; clicks outside are already
    // handled by the mousedown listener above.
    if (!next) return;
    if (containerRef.current?.contains(next)) return;
    setOpen(false);
  };

  const closeOnEscape = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (inlineOptions || event.key !== 'Escape' || !isOpen) return;
    event.stopPropagation();
    setOpen(false);
    containerRef.current
      ?.querySelector<HTMLElement>('[test-id="multi-select-button"]')
      ?.focus();
  };

  const checkedOptions = options?.filter((option) => option.checked) || [];
  let openButtonLabel = label;
  if (checkedOptions.length > 1) {
    openButtonLabel = `${checkedOptions.length} optie${
      checkedOptions.length !== 1 ? 's' : ''
    } geselecteerd`;
  } else if (checkedOptions.length === 1) {
    openButtonLabel = checkedOptions[0].label;
  }

  return (
    <div
      className={`multi-select ${
        inlineOptions ? 'multiselect-container--inline' : ''
      }`}
      ref={containerRef}
      onBlur={closeOnFocusLeave}
      onKeyDown={closeOnEscape}>
      {!inlineOptions && (
        <Button
          appearance="default-button"
          onClick={() => {
            setOpen(!isOpen);
          }}
          test-id="multi-select-button"
          aria-labelledby={id}
          aria-expanded={isOpen}>
          {openButtonLabel}
          <Icon icon={isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
        </Button>
      )}

      {isOpen && (
        <fieldset
          className={`multiselect-container ${inlineOptions ? 'multiselect-container--inline' : ''}`}
          role="group">
          {legend && <legend className="sr-only">{legend}</legend>}
          {options?.map((option, index) => {
            const checkboxId = `${id}-option-${index}`;
            return (
              <div key={`multi-select-item-${option.label}`}>
                <FormField type="checkbox">
                  <Paragraph className="utrecht-form-field__label utrecht-form-field__label--checkbox">
                    {/* onChange on the checkbox, not onClick on the div: a click
                        on the linked label bubbles up and is also forwarded to
                        the checkbox, which toggled twice on the div. */}
                    <Checkbox
                      className="utrecht-form-field__input"
                      id={checkboxId}
                      checked={option.checked}
                      onChange={() =>
                        onItemSelected(option.value, option.label)
                      }
                    />
                    <FormLabel type="checkbox" htmlFor={checkboxId}>
                      {option.label}
                    </FormLabel>
                  </Paragraph>
                </FormField>
              </div>
            );
          })}
        </fieldset>
      )}
    </div>
  );
}
