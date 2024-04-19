import React, { FC, useState } from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    RadioButton,
    Paragraph, FormFieldDescription,
} from "@utrecht/component-library-react";
import { Spacer } from '@openstad-headless/ui/src';

export type RadioboxFieldProps = {
    title: string;
    description?: string;
    choices: string[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: { name: string, value: string | Record<number, never> | [] }) => void;
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
            <Fieldset role="radiogroup">
                <FieldsetLegend>
                    {title}
                </FieldsetLegend>

                {description &&
                    <>
                        <FormFieldDescription>
                            {description}
                        </FormFieldDescription>
                        <Spacer size={.5} />
                    </>
                }

                {choices?.map((choice, index) => (
                    <FormField type="radio" key={index}>
                        <Paragraph className="utrecht-form-field__label utrecht-form-field__label--radio">
                            <FormLabel htmlFor={`${fieldKey}_${index}`} type="radio" className="--label-grid">
                                <RadioButton
                                    className="utrecht-form-field__input"
                                    id={`${fieldKey}_${index}`}
                                    name={fieldKey}
                                    required={fieldRequired}
                                    onChange={() => onChange ? onChange({
                                        name: fieldKey,
                                        value: choice
                                    }) : null}
                                    disabled={disabled}
                                />
                                <span>{choice}</span>
                            </FormLabel>
                        </Paragraph>
                    </FormField>
                ))}
            </Fieldset>
        </div>
    );
};

export default RadioboxField;
