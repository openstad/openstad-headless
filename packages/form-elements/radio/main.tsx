import React, { FC, useState } from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    RadioButton,
    Paragraph,
} from "@utrecht/component-library-react";
import { RadioboxFieldProps } from "./props";

const RadioboxField: FC<RadioboxFieldProps> = ({
    question,
    choices,
    fieldRequired = false,
    requiredWarning= 'Dit veld is verplicht.',
}) => {
    const randomID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const [selectedChoice, setSelectedChoice] = useState<string | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const isValid = (): boolean => {
        if (fieldRequired && !selectedChoice) {
            setErrorMessage(requiredWarning);
            return false;
        }

        setErrorMessage(undefined);
        return true;
    };

    const handleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const choiceValue = event.target.value;
        setSelectedChoice(choiceValue);
        isValid();
    };

    return (
        <div className="question">
            <Fieldset id={randomID}>
                <FieldsetLegend>{question}</FieldsetLegend>

                {choices.map((choice, index) => (
                    <FormField type="radio" key={index}>
                        <Paragraph className="radio-field-label">
                            <FormLabel htmlFor={`${randomID}_${index}`} type="radio">
                                <RadioButton
                                    className="radio-field-input"
                                    id={`${randomID}_${index}`}
                                    name={randomID}
                                    value={choice}
                                    required={fieldRequired}
                                    checked={selectedChoice === choice}
                                    onChange={handleChoiceChange}
                                />
                                {choice}
                            </FormLabel>
                        </Paragraph>
                    </FormField>
                ))}
            </Fieldset>
            {errorMessage && (
                <p className="error-message">{errorMessage}</p>
            )}
        </div>
    );
};

export default RadioboxField;