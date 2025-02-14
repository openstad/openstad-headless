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
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (reset) {
            reset(() => setValue(defaultValue));
        }
    }, [reset, defaultValue]);

    return (
        <FormField type="text">
            {title && (
                <Paragraph className="utrecht-form-field__label">
                    <FormLabel htmlFor={randomID}>{title}</FormLabel>
                </Paragraph>
            )}
            {description &&
                <>
                    <FormFieldDescription dangerouslySetInnerHTML={{__html: description}} />
                    <Spacer size={.5} />
                </>
            }

            <div className={`utrecht-form-field__input`}>
                {prepend && <span className="utrecht-form-field__prepend">{prepend}</span>}
                <Textbox
                    id={randomID}
                    name={fieldKey}
                    type={'number'}
                    value={value}
                    onChange={(e) => {
                        const newValue = parseFloat(e.target.value) < 0 ? "0" : e.target.value;

                        setValue(newValue);
                        if (onChange) {
                            onChange({
                                name: fieldKey,
                                value: newValue,
                            });
                        }
                    }}
                    disabled={disabled}
                    autoComplete={'off'}
                />
                {append && <span className="utrecht-form-field__append">{append}</span>}
            </div>
        </FormField>
    );
};

export default NumberInput;
