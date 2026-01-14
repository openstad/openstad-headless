import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { PostcodeAutoFillLocation } from '../stem-begroot-and-resource-overview/filter';
import {Select} from "../select";
import {FormLabel} from "@utrecht/component-library-react";

const proximityOptions = [
  { label: '100 meter', value: "0.1" },
  { label: '250 meter', value: "0.25" },
  { label: '500 meter', value: "0.5" },
  { label: '1 km', value: "1" },
  { label: '2 km', value: "2" },
  { label: '3 km', value: "3" },
];

type Props = {
  onValueChange: (location: PostcodeAutoFillLocation) => void;
  locationDefault: PostcodeAutoFillLocation;
  zipCodeAutofillApiUrl?: string;
  zipCodeApiUrl?: string;
};

type Suggestion = {
  postcode: string;
  straat: string;
  woonplaats: string;
};

type FullSuggestion = Suggestion & {
  huisnummer: string;
  gemeente: string;
  provincie: string;
  latitude: string;
  longitude: string;
};

export default function PostcodeAutoFill({ onValueChange, locationDefault, ...props }: Props) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FullSuggestion | null>(null);
  const [proximity, setProximity] = useState("0.5");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ( !locationDefault && input !== '' ) {
      reset();
      setProximity("0.5");
    }
  }, [ locationDefault ]);

  useEffect(() => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setLoading(true);

      fetch(`${props?.zipCodeAutofillApiUrl || ''}${input}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data.results || []);
          setShowDropdown(true);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Fout bij ophalen suggesties:', err);
          }
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [input]);

  const handleSelect = async (s: Suggestion) => {
    setShowDropdown(false);
    try {
      const res = await fetch(`${props?.zipCodeApiUrl || ''}${s.postcode}`);
      const data = await res.json();
      const full = data.results?.[0];
      if (full) {
        setSelected(full);
        setInput(`${full.postcode} ${full.straat}`);
      }
    } catch (e) {
      console.error('Fout bij ophalen postcode info:', e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        if (!selected) setInput('');
        setShowDropdown(false);
        setHighlightedIndex(0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [selected]);

  const reset = () => {
    setInput('');
    setSuggestions([]);
    setSelected(null);
    setShowDropdown(false);
    setHighlightedIndex(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (selected) {
      const location = {
        lat: selected.latitude,
        lng: selected.longitude,
        proximity: parseFloat(proximity),
      };
      onValueChange(location);
    } else {
      onValueChange(undefined);
    }
  }, [selected, proximity]);

  return (
    <>
      <div className="form-element postcode-autofill" ref={wrapperRef}>
        <FormLabel htmlFor={'locationField'}>Selecteer postcode</FormLabel>
        <div className="input-wrapper">
          <input
            type="text"
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setSelected(null);
              setShowDropdown(true);
            }}
            disabled={!!selected}
            className="utrecht-textbox utrecht-textbox--html-input"
            id="locationField"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="suggestion-list"
            aria-expanded={showDropdown}
            aria-activedescendant={ showDropdown && suggestions.length > 0 ? `suggestion-${highlightedIndex}` : undefined }
            role="combobox"
          />
          {selected && (
            <button
              className="clear-button"
              onClick={reset}
              type="button"
              aria-label="Wis selectie"
            >
              ✕
            </button>
          )}
        </div>

        {loading && <p className="loading" aria-live="polite">Laden...</p>}

        {!loading && showDropdown && suggestions.length > 0 && (
          <ul className="suggestion-list" id="suggestion-list" role="listbox"
              onKeyDown={e => {
                if (showDropdown && suggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
                    e.preventDefault();
                  } else if (e.key === 'ArrowUp') {
                    setHighlightedIndex(i => Math.max(i - 1, 0));
                    e.preventDefault();
                  } else if (e.key === 'Enter') {
                    handleSelect(suggestions[highlightedIndex]);
                    e.preventDefault();
                  } else if (e.key === ' ') {
                    e.preventDefault();
                  }
                }
              }}
          >
            {suggestions.map((s: Suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSelect(s)}
                role="option"
                id={`suggestion-${index}`}
                aria-selected={highlightedIndex === index}
                tabIndex={-1}
              >
                <strong>{s.postcode}</strong> {s.straat}, {s.woonplaats}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-element">
        <FormLabel htmlFor={'proximityField'}>Selecteer straal</FormLabel>
        <Select
          onValueChange={(value) => setProximity(value)}
          options={proximityOptions}
          id="proximityField"
          value={proximity}
          disableDefaultOption={true}
        />
      </div>
    </>
  );
}
