import React, {FC, useEffect, useState} from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    Checkbox,
    Paragraph, FormFieldDescription,
} from "@utrecht/component-library-react";
import { Spacer } from '@openstad-headless/ui/src';

export type CheckboxFieldProps = {
    title: string;
    description?: string;
    choices?: string[] | [{value: string, label: string}];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {name: string, value: string | Record<number, never> | []}) => void;
}

const CheckboxField: FC<CheckboxFieldProps> = ({
       title,
       description,
       choices,
       fieldRequired = false,
       fieldKey,
       onChange,
       disabled = false,
}) => {
    const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

    useEffect(() => {
        if (onChange) {
            onChange({
                name: fieldKey,
                value: JSON.stringify(selectedChoices)
            });
        }
    } , [selectedChoices]);

    const handleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const choiceValue = event.target.value;
        if (event.target.checked) {
            setSelectedChoices([...selectedChoices, choiceValue]);
        } else {
            setSelectedChoices(selectedChoices.filter((choice) => choice !== choiceValue));
        }
    };

    if (choices) {
        choices = choices?.map((choice) => {
            if (typeof choice === 'string') {
                return {value: choice, label: choice}
            } else {
                return choice;
            }
        }) as [{ value: string, label: string }];
    }

    return (
        <div className="question">
            <Fieldset role="group">
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
                    <FormField type="checkbox" key={index}>
                        <Paragraph className="utrecht-form-field__label utrecht-form-field__label--checkbox">
                            <FormLabel htmlFor={`${fieldKey}_${index}`} type="checkbox" className="--label-grid">
                                <Checkbox
                                    className="utrecht-form-field__input"
                                    id={`${fieldKey}_${index}`}
                                    name={fieldKey}
                                    value={choice && choice.value}
                                    required={fieldRequired}
                                    checked={choice && choice.value ? selectedChoices.includes(choice.value) : false}
                                    onChange={handleChoiceChange}
                                    disabled={disabled}
                                />
                                <span>{choice && choice.label}</span>
                            </FormLabel>
                        </Paragraph>
                    </FormField>
                ))}
            </Fieldset>
        </div>
    );
};

export default CheckboxField;
