import React, { FC, useState } from "react";
import { FormField, FormFieldDescription, FormLabel, Paragraph, Textarea, Textbox } from "@utrecht/component-library-react";
import { Spacer } from '@openstad-headless/ui/src';

export type TextInputProps = {
    title: string;
    description?: string;
    minCharacters?: number;
    minCharactersWarning?: string;
    maxCharacters?: number;
    maxCharactersWarning?: string;
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    variant?: 'text input' | 'textarea';
    placeholder?: string;
    defaultValue?: string;
    disabled?: boolean;
    rows?: TextInputProps['variant'] extends 'textarea' ? number : undefined;
    type?: string;
    onChange?: (e: { name: string, value: string | Record<number, never> | [] }) => void;
}

const TextInput: FC<TextInputProps> = ({
    title,
    description,
    variant,
    fieldKey,
    fieldRequired = false,
    placeholder = '',
    defaultValue = '',
    onChange,
    disabled = false,
    rows,
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const InputComponent = variant === 'textarea' ? Textarea : Textbox;

    return (
        <FormField type="text">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={randomID}>{title}</FormLabel>
            </Paragraph>
            {description &&
                <>
                    <FormFieldDescription>
                        {description}
                    </FormFieldDescription>
                    <Spacer size={.5} />
                </>
            }
            <div className="utrecht-form-field__input">
                <InputComponent
                    id={randomID}
                    name={fieldKey}
                    required={fieldRequired}
                    type="text"
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    onChange={(e) => {
                        if (onChange) {
                            onChange({
                                name: fieldKey,
                                value: e.target.value,
                            });
                        }
                    }}
                    disabled={disabled}
                    rows={rows}
                />
            </div>
        </FormField>
    );
};

export default TextInput;
