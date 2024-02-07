import React, { forwardRef, useEffect, useState } from 'react';
import './index.css';

type Props = {
  onValueChange?: (value: string) => void;
  initialvalue: string;
  min: string;
  max: string;
  step: string;
  labels?: Array<string | React.JSX.Element>;
} & React.SelectHTMLAttributes<HTMLInputElement>;

const RangeSlider = forwardRef<HTMLInputElement, Props>(
  ({ onValueChange, ...props }, ref) => {
    const [value, setValue] = useState(props.initialvalue);

    useEffect(() => {
      setValue(props.initialvalue);
    }, [props.initialvalue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    return (
      <div className={`range-slider ${props.className}`}>
        <p>
          Geef antwoord op een schaal van 1 tot 5, waarbij 1 = slecht en 5 =
          goed.
        </p>
        <input
          ref={ref}
          {...props}
          onChange={handleChange}
          value={value}
          title={props.title || 'scale'}
          type="range"
          name={props.name}
        />
        <div className="range-slider-labels">
          {props.labels?.map((label, index) => (
            <React.Fragment key={index}>{label}</React.Fragment>
          ))}
        </div>
      </div>
    );
  }
);

export { RangeSlider };
