import React, { forwardRef } from 'react';
import './index.css';

type Props = {
  onValueChange?: (resource: any) => void;
  labels?: Array<string | React.JSX.Element>;
} & React.SelectHTMLAttributes<HTMLInputElement>;

const RangeSlider = forwardRef<HTMLInputElement, Props>(
  ({ onValueChange, ...props }, ref) => {
    return (
      <div className={`range-slider ${props.className}`}>
        <p>
          Geef antwoord op een schaal van 1 tot 5, waarbij 1 = slecht en 5 =
          goed.
        </p>
        <input
          ref={ref}
          {...props}
          onChange={
            props.onChange ||
            ((e) => onValueChange && onValueChange(e.target.value))
          }
          title="scale"
          type="range"
          min="1"
          max={props.labels?.length || '5'}
          id="fader"
          step="1"
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
