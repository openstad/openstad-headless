import React, { forwardRef } from 'react';

import { Image } from '../image';
import '../index.css';
import './index.css';

type Props = {
  onValueChange?: (resource: any) => void;
  images: Array<string>;
  items: Array<string>;
} & React.SelectHTMLAttributes<HTMLInputElement>;

export const ImageSelect = forwardRef<HTMLInputElement, Props>(
  ({ onValueChange, ...props }, ref) => {
    const [selected, setSelected] = React.useState<number | null>(null);

    return (
      <div className="osc-imageselect">
        {props.items?.map((title, index) => (
          <div
            key={index}
            className={`osc-imageselect-item ${
              selected === index ? 'osc-imageselect-item-selected' : ''
            }`}
            onClick={() => setSelected(index)}>
            <input
              ref={ref}
              {...props}
              className={`osc-imageselect-radio ${props.className}`}
              onChange={
                props.onChange ||
                ((e) => onValueChange && onValueChange(e.target.value))
              }
              type="radio"
              id={`${index}`}
            />
            <label htmlFor={`${index}`} className="osc-imageselect-image">
              <Image src={props.images[index]} />
            </label>
            <p>{title}</p>
          </div>
        ))}
      </div>
    );
  }
);
