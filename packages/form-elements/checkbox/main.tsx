import React, { FC, useState } from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    Checkbox,
    Paragraph,
} from "@utrecht/component-library-react";
import { CheckboxFieldProps } from "./props";

const CheckboxField: FC<CheckboxFieldProps> = ({
       question,
       description,
       choices,
       fieldRequired = false,
       requiredWarning = "Dit veld is verplicht.",
}) => {
    const randomID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const isValid = (): boolean => {
        if (fieldRequired && selectedChoices.length === 0) {
            setErrorMessage(requiredWarning);
            return false;
        }

        setErrorMessage(undefined);
        return true;
    };

    const handleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const choiceValue = event.target.value;
        if (event.target.checked) {
            setSelectedChoices([...selectedChoices, choiceValue]);
        } else {
            setSelectedChoices(selectedChoices.filter((choice) => choice !== choiceValue));
        }
        isValid();
    };

    return (
        <div className="question">
            <Fieldset id={randomID}>
                <FieldsetLegend>
                    {question}
                    {description && <p>{description}</p>}
                </FieldsetLegend>

                {choices.map((choice, index) => (
                    <FormField type="checkbox" key={index}>
                        <Paragraph className="checkbox-field-label">
                            <FormLabel htmlFor={`${randomID}_${index}`} type="checkbox">
                                <Checkbox
                                    className="checkbox-field-input"
                                    id={`${randomID}_${index}`}
                                    name={randomID}
                                    value={choice}
                                    required={fieldRequired}
                                    checked={selectedChoices.includes(choice)}
                                    onChange={handleChoiceChange}
                                />
                                {choice}
                            </FormLabel>
                        </Paragraph>
                    </FormField>
                ))}
            </Fieldset>
            {errorMessage && (
                <p className="utrecht-form-field__error-message">{errorMessage}</p>
            )}
        </div>
    );
};

export default CheckboxField;
