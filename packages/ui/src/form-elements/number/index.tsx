import React, { FC, useState, useEffect } from "react";
import {
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
    Textbox
} from "@utrecht/component-library-react";
import {Spacer } from '@openstad-headless/ui/src';
import './style.css';

export type NumberInputProps = {
    title: string;
    description?: string;
    requiredWarning?: string;
    fieldKey: string;
    defaultValue?: string | number;
    disabled?: boolean;
    onChange?: (e: { name: string, value: string | Record<number, never> | [] }) => void;
    reset?: (resetFn: () => void) => void;
    format?: boolean;
    prepend?: string;
    append?: string;
    type?: string;
    placeholder?: string;
}

const NumberInput: FC<NumberInputProps> = ({
    title,
    description,
    fieldKey,
    defaultValue = '',
    onChange,
    disabled = false,
    reset,
    format = false,
    prepend,
    append,
    placeholder = '',
}) => {
  const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const [value, setValue] = useState(defaultValue);
  const MAX_VALUE = 1_000_000_000_000;

  useEffect(() => {
    if (reset) {
      reset(() => setValue(defaultValue));
    }
  }, [reset, defaultValue]);

  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, "").replace(/^0+/, "");

    if (inputValue === "") {
      setValue("");
      if (onChange) {
        onChange({
          name: fieldKey,
          value: "",
        });
      }
      return;
    }

    let numericValue = parseInt(inputValue, 10);
    if (numericValue > MAX_VALUE) {
      numericValue = MAX_VALUE;
      inputValue = MAX_VALUE.toString();
    }

    setValue(format ? formatNumber(inputValue) : inputValue);

    if (onChange) {
      onChange({
        name: fieldKey,
        value: (numericValue).toString(),
      });
    }
  };

  return (
    <FormField type="text">
      {title && (
        <Paragraph className="utrecht-form-field__label">
          <FormLabel htmlFor={randomID}>{title}</FormLabel>
        </Paragraph>
      )}
      {description && (
        <>
          <FormFieldDescription dangerouslySetInnerHTML={{__html: description}}/>
          <Spacer size={0.5}/>
        </>
      )}

      <div className={`utrecht-form-field__input`}>
        {prepend && <span className="utrecht-form-field__prepend">{prepend}</span>}
        <Textbox
          id={randomID}
          name={fieldKey}
          type="text"
          value={value}
          onChange={handleChange}
          onPaste={(e) => {
            e.preventDefault();
            let pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
            let numericValue = parseInt(pastedData, 10);
            if (numericValue > MAX_VALUE) numericValue = MAX_VALUE;

            setValue(format ? formatNumber(numericValue.toString()) : numericValue.toString());

            if (onChange) {
              onChange({
                name: fieldKey,
                value: (numericValue).toString(),
              });
            }
          }}
          disabled={disabled}
          autoComplete="off"
          placeholder={placeholder}
        />
        {append && <span className="utrecht-form-field__append">{append}</span>}
      </div>
    </FormField>
  );
};

export default NumberInput;
