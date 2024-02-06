import React, { FC, useState } from "react";
import { FormField, FormFieldDescription, FormLabel, Paragraph, Textarea, Textbox } from "@utrecht/component-library-react";
import { TextInputProps } from "./props";

const TextInput: FC<TextInputProps> = ({
    title,
    description,
    variant,
    fieldKey,
    fieldRequired= false,
    value,
    onChange
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const InputComponent = variant === 'textarea' ? Textarea : Textbox;

    return (
        <FormField type="text">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={randomID}>{title}</FormLabel>
                <FormFieldDescription>{description}</FormFieldDescription>
            </Paragraph>
            <div className="utrecht-form-field__input">
                <InputComponent
                    id={randomID}
                    name={fieldKey}
                    required={fieldRequired}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e);
                    }}
                />
            </div>
        </FormField>
    );
};

export default TextInput;
