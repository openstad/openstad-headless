import '@utrecht/component-library-css';
import { Textbox } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React, { useEffect, useId, useRef, useState } from 'react';

import { IconButton } from '../iconbutton';
import './index.css';

export type ComboboxOption = {
  id: string;
  label: string;
  image?: string;
  group?: string;
};

export type ComboboxProps = {
  id?: string;
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
  placeholder?: string;
  selected: ComboboxOption[];
  onChange: (selected: ComboboxOption[]) => void;
  loadOptions: (query: string) => Promise<ComboboxOption[]>;
  minQueryLength?: number;
  debounceMs?: number;
  minQueryText?: string;
  loadingText?: string;
  noResultsText?: string;
  resultsText?: string;
  errorText?: string;
  removeText?: string;
};

type SearchState = 'idle' | 'loading' | 'done' | 'error';

export function Combobox({
  id,
  labelledBy,
  describedBy,
  invalid = false,
  placeholder = 'Zoeken...',
  selected,
  onChange,
  loadOptions,
  minQueryLength = 2,
  debounceMs = 300,
  minQueryText = 'Typ minimaal {minQueryLength} tekens om te zoeken',
  loadingText = 'Laden...',
  noResultsText = 'Geen resultaten gevonden',
  resultsText = '{count} resultaten beschikbaar',
  errorText = 'Zoeken is mislukt, probeer het opnieuw',
  removeText = 'Verwijder {label}',
}: ComboboxProps) {
  const generatedId = useId();
  const inputId = id || `osc-combobox-${generatedId}`;
  const listboxId = `${inputId}-listbox`;
  const statusId = `${inputId}-status`;

  const inputRef = useRef<HTMLInputElement>(null);
  const requestCounter = useRef(0);

  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchState, setSearchState] = useState<SearchState>('idle');

  const selectedIds = selected.map((option) => option.id);
  const visibleOptions = options.filter(
    (option) => !selectedIds.includes(option.id)
  );
  const trimmedQuery = query.trim();
  const queryTooShort =
    trimmedQuery.length > 0 && trimmedQuery.length < minQueryLength;

  useEffect(() => {
    if (trimmedQuery.length < minQueryLength) {
      requestCounter.current += 1;
      setOptions([]);
      setSearchState('idle');
      return;
    }

    const requestId = ++requestCounter.current;
    setSearchState('loading');
    const timeout = setTimeout(() => {
      loadOptions(trimmedQuery)
        .then((result) => {
          if (requestId !== requestCounter.current) return;
          setOptions(Array.isArray(result) ? result : []);
          setSearchState('done');
          setActiveIndex(-1);
        })
        .catch(() => {
          if (requestId !== requestCounter.current) return;
          setOptions([]);
          setSearchState('error');
        });
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [trimmedQuery, minQueryLength, debounceMs]);

  const selectOption = (option: ComboboxOption) => {
    onChange([...selected, option]);
    setQuery('');
    setOptions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const removeOption = (option: ComboboxOption) => {
    onChange(selected.filter((item) => item.id !== option.id));
    inputRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) =>
        visibleOptions.length ? (index + 1) % visibleOptions.length : -1
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) =>
        visibleOptions.length
          ? (index - 1 + visibleOptions.length) % visibleOptions.length
          : -1
      );
    } else if (event.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && visibleOptions[activeIndex]) {
        event.preventDefault();
        selectOption(visibleOptions[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  const statusText = queryTooShort
    ? minQueryText.replace('{minQueryLength}', String(minQueryLength))
    : searchState === 'loading'
      ? loadingText
      : searchState === 'error'
        ? errorText
        : searchState === 'done'
          ? visibleOptions.length
            ? resultsText.replace('{count}', String(visibleOptions.length))
            : noResultsText
          : '';

  const showListbox = isOpen && visibleOptions.length > 0;
  const activeOptionId =
    showListbox && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined;

  return (
    <div className="osc-combobox">
      <div className="osc-combobox-input-wrapper">
        <Textbox
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showListbox}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-labelledby={labelledBy}
          aria-describedby={[describedBy, statusId].filter(Boolean).join(' ')}
          aria-invalid={invalid}
          invalid={invalid}
          placeholder={placeholder}
          value={query}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          onKeyDown={onKeyDown}
        />
        <ul
          id={listboxId}
          role="listbox"
          className="osc-combobox-listbox"
          aria-labelledby={labelledBy}
          hidden={!showListbox}>
          {visibleOptions.map((option, index) => (
            <li
              key={option.id}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`osc-combobox-option${
                index === activeIndex ? ' --active' : ''
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}>
              {option.image ? (
                <img
                  className="osc-combobox-option-image"
                  src={option.image}
                  alt=""
                />
              ) : null}
              <span className="osc-combobox-option-label">{option.label}</span>
              {option.group ? (
                <span className="osc-combobox-option-group">
                  {option.group}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <p id={statusId} className="osc-combobox-status" aria-live="polite">
        {statusText}
      </p>

      {selected.length > 0 ? (
        <ul className="osc-combobox-chips">
          {selected.map((option) => (
            <li key={option.id} className="osc-combobox-chip">
              <span>{option.label}</span>
              <IconButton
                type="button"
                className="subtle-button"
                icon="ri-close-line"
                iconOnly={true}
                aria-label={removeText.replace('{label}', option.label)}
                onClick={() => removeOption(option)}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default Combobox;
