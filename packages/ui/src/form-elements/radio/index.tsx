import React, { FC, useState } from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    RadioButton,
    Paragraph, FormFieldDescription,
} from "@utrecht/component-library-react";

export type RadioboxFieldProps = {
    title: string;
    description?: string;
    choices: string[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    onChange?: (e: {name: string, value: string | string[] | []}) => void;
}

const RadioboxField: FC<RadioboxFieldProps> = ({
    title,
    description,
    choices,
    fieldRequired = false,
    fieldKey,
    onChange,
    disabled = false,
}) => {
    return (
        <div className="question">
            <Fieldset>
                <FieldsetLegend>
                    {title}
                </FieldsetLegend>

                {description &&
                    <FormFieldDescription>
                        {description}
                    </FormFieldDescription>
                }

                {choices?.map((choice, index) => (
                    <FormField type="radio" key={index}>
                        <Paragraph className="radio-field-label">
                            <FormLabel htmlFor={`${fieldKey}_${index}`} type="radio">
                                <RadioButton
                                    className="radio-field-input"
                                    id={`${fieldKey}_${index}`}
                                    name={fieldKey}
                                    required={fieldRequired}
                                    onChange={() => onChange ? onChange({
                                        name: fieldKey,
                                        value: choice
                                    }) : null}
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
