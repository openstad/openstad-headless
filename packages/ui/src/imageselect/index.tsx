import React, { forwardRef, useEffect } from 'react';

import { Image } from '../image';
import '../index.css';
import './index.css';

type Props = {
  onValueChange?: (resource: any) => void;
  images: Array<string>;
  items: Array<{ key: string; text: string }>;
} & React.SelectHTMLAttributes<HTMLInputElement>;

export const ImageSelect = forwardRef<HTMLInputElement, Props>(
  ({ onValueChange, ...props }, ref) => {
    const [selected, setSelected] = React.useState<number | null>(null);

    useEffect(() => {
      if (selected !== null && onValueChange) {
        onValueChange(props.items[selected]);
      }
    }, [selected, props.items, onValueChange]);

    return (
      <div className="osc-imageselect">
        {props.items?.map((item, index) => (
          <div
            key={index}
            className={`osc-imageselect-item ${
              selected === index ? 'osc-imageselect-item-selected' : ''
            }`}
            onClick={() => !props.disabled && setSelected(index)}>
            <input
              ref={ref}
              {...props}
              name={props.name}
              className={`osc-imageselect-radio ${props.className}`}
              type="radio"
              checked={selected === index}
              id={`${props.name}-${index}`}
              value={item.key}
            />
            <label htmlFor={`${props.name}-${index}`}>
              <Image
                src={props.images[index]}
                className="osc-imageselect-image"
              />
            </label>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    );
  }
);
