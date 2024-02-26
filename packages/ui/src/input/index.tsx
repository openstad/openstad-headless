import '../index.css';
import './index.css';
import React, { forwardRef, useEffect, useState } from 'react';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { FormField, Paragraph, FormLabel, Textbox, FormFieldDescription } from "@utrecht/component-library-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  errors?: string;
  info?: string;
  label?: string;
};


const Input = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const [inputID, setInputID] = useState<string>('');

  useEffect(() => {
    if (inputID.length === 0) {
      setInputID(Math.random().toString(36).substring(7));
    }
  }, []);

  return (
    <FormField
      invalid={props.errors ? true : false}
      type="search"
    >
      {props.label ? (
        <Paragraph>
          <FormLabel htmlFor={inputID}>
            {props.label}
          </FormLabel>
        </Paragraph>
      ) : null}
        <Textbox
          ref={ref}
          id={inputID}
          invalid={props.errors ? true : false}
          name="search"
          {...props}
          type={'text'}
        />

      {props.errors ? (
        <FormFieldDescription
          className="utrecht-form-field__description"
          id={`${inputID}-invalid-description`}
          invalid>
          {props.errors}
        </FormFieldDescription>
      ) : null}
      {props.info && !props.errors ? (
        <FormFieldDescription
          className="utrecht-form-field__description"
          id={`${inputID}-invalid-description`}>
          {props.info}
        </FormFieldDescription>
      ) : null}

    </FormField>
  );
});

export { Input };
