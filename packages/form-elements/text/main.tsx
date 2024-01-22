import React, { FC, useState } from "react";
import { FormField, FormFieldDescription, FormLabel, Paragraph, Textarea, Textbox } from "@utrecht/component-library-react";
import { TextInputProps } from "./props";

const TextInput: FC<TextInputProps> = ({
    title,
    description,
    variant,
    fieldName,
    minCharacters,
    minCharactersWarning = `Dit veld moet minimaal ${minCharacters} karakters bevatten.`,
    maxCharacters,
    maxCharactersWarning = `Dit veld mag maximaal ${maxCharacters} karakters bevatten.`,
    fieldRequired= false,
    requiredWarning = 'Dit veld is verplicht.',
    value,
    onChange
}) => {
    const randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const InputComponent = variant === 'textarea' ? Textarea : Textbox;

    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const isValid = (inputValue: string): boolean => {
        if (fieldRequired && inputValue.trim() === '') {
            setErrorMessage(requiredWarning);
            return false;
        }

        if (minCharacters !== undefined && inputValue.length < minCharacters) {
            setErrorMessage(minCharactersWarning);
            return false;
        }

        if (maxCharacters !== undefined && inputValue.length > maxCharacters) {
            setErrorMessage(maxCharactersWarning);
            return false;
        }

        setErrorMessage(undefined);
        return true;
    };

    return (
        <FormField invalid={!!errorMessage} type="text">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={randomID}>{title}</FormLabel>
                <FormFieldDescription>{description}</FormFieldDescription>
            </Paragraph>
            <div className="utrecht-form-field__input">
                <InputComponent
                    id={randomID}
                    name={fieldName}
                    required={fieldRequired}
                    type="text"
                    value={value}
                    onChange={(e) => {
                        isValid(e.target.value);
                        onChange(e.target.value);
                    }}
                />
                {errorMessage && (
                    <p className="utrecht-form-field__error-message">{errorMessage}</p>
                )}
            </div>
        </FormField>
    );
};

export default TextInput;
