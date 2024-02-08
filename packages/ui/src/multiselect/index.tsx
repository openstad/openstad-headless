import React, { useState } from 'react';
import { Checkbox } from '../checkbox';
import { Icon } from '../icon';
import './index.css';

export function MultiSelect({
  label,
  onItemSelected,
  defaultOpen,
  options,
}: {
  label: string;
  options: Array<{ value: string; label: string; checked?: boolean }>;
  defaultOpen?: boolean;
  onItemSelected: (optionValue: string) => void;
}) {
  const [isOpen, setOpen] = useState<boolean>(defaultOpen || false);

  return (
    <div className="multi-select">
      <div
        className="multi-select-header"
        onClick={() => {
          setOpen(!isOpen);
        }}>
        <p>{label}</p>
        <Icon icon={isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
      </div>

      <section>
        {isOpen
          ? options.map((option) => {
              return (
                <div
                  onClick={() => {
                    const value = option.value;
                    onItemSelected(value);
                  }}
                  className="multi-select-item"
                  key={`multi-select-item-${option.label}`}>
                  <Checkbox checked={option.checked} />
                  <p>{option.label}</p>
                </div>
              );
            })
          : null}
      </section>
    </div>
  );
}
