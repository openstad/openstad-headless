import React, { FC, useState } from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    RadioButton,
    Paragraph,
} from "@utrecht/component-library-react";

export type RadioboxFieldProps = {
    question: string;
    choices: string[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
}

const RadioboxField: FC<RadioboxFieldProps> = ({
    question,
    choices,
    fieldRequired = false,
    fieldKey,
    onChange,
    disabled = false,
}) => {
    return (
        <div className="question">
            <Fieldset>
                <FieldsetLegend>{question}</FieldsetLegend>

                {choices.map((choice, index) => (
                    <FormField type="radio" key={index}>
                        <Paragraph className="radio-field-label">
                            <FormLabel htmlFor={`${fieldKey}_${index}`} type="radio">
                                <RadioButton
                                    className="radio-field-input"
                                    id={`${fieldKey}_${index}`}
                                    name={fieldKey}
                                    required={fieldRequired}
                                    onChange={() => onChange({
                                        name: fieldKey,
                                        value: choice
                                    })}
                                    disabled={disabled}
                                />
                                {choice}
                            </FormLabel>
                        </Paragraph>
                    </FormField>
                ))}
            </Fieldset>
        </div>
    );
};

export default RadioboxField;