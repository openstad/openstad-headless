import { FormLabel } from '@utrecht/component-library-react';
import React, { useId } from 'react';

import { Combobox, ComboboxOption } from '../../combobox';

export type StreetOption = { street: string; city: string };

export function streetOptionId(option: StreetOption) {
  return `${option.street}|${option.city}`;
}

export function filterStreetOptions(
  options: Array<StreetOption>,
  query: string
): Array<StreetOption> {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return options;
  return options.filter((option) =>
    `${option.street} ${option.city}`.toLowerCase().includes(normalizedQuery)
  );
}

function toComboboxOption(option: StreetOption): ComboboxOption {
  return {
    id: streetOptionId(option),
    label: option.city ? `${option.street} (${option.city})` : option.street,
  };
}

type Props = {
  options: Array<StreetOption>;
  selected: Array<StreetOption>;
  onChange: (selected: Array<StreetOption>) => void;
  label?: string;
  displayHint?: boolean;
  hint?: string;
  placeholder?: string;
};

export function StreetFilter({
  options,
  selected,
  onChange,
  label,
  displayHint,
  hint,
  placeholder,
}: Props) {
  const fieldId = useId();
  const inputId = `osc-street-filter-${fieldId}`;
  const labelId = `${inputId}-label`;
  const hintId = `${inputId}-hint`;
  const showHint = !!(displayHint && hint);

  const handleChange = (next: Array<ComboboxOption>) => {
    const known = [...options, ...selected];
    onChange(
      next
        .map((option) =>
          known.find((street) => streetOptionId(street) === option.id)
        )
        .filter((street): street is StreetOption => !!street)
    );
  };

  return (
    <div className="form-element street-filter">
      <FormLabel htmlFor={inputId} id={labelId}>
        {label || 'Straat'}
      </FormLabel>
      {showHint ? (
        <p id={hintId} className="form-element-hint">
          {hint}
        </p>
      ) : null}
      <Combobox
        id={inputId}
        labelledBy={labelId}
        describedBy={showHint ? hintId : undefined}
        placeholder={placeholder || undefined}
        selected={selected.map(toComboboxOption)}
        onChange={handleChange}
        loadOptions={async (query) =>
          filterStreetOptions(options, query).map(toComboboxOption)
        }
        loadOnFocus
        minQueryLength={1}
      />
    </div>
  );
}
