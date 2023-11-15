import React, { useState } from 'react';
import './index.css';
import { Icon } from '../icon';

export function MultiSelect({
  label,
  onItemSelected,
  defaultOpen,
  options,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultOpen?: boolean;
  allowMultiple?: boolean;
  onItemSelected: () => void;
}) {
  const [isOpen, setOpen] = useState<boolean>(defaultOpen || false);

  return (
    <div className="osc-2-multi-select">
      <div
        className="osc-2-multi-select-header"
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
                  className="ocs-2-multi-select-item"
                  key={`ocs-2-multi-select-item-${option.label}`}>
                  <p>{option.label}</p>
                </div>
              );
            })
          : null}
      </section>
    </div>
  );
}
