import React, {FC, useEffect, useState} from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    Checkbox,
    Paragraph, FormFieldDescription,
} from "@utrecht/component-library-react";

export type CheckboxFieldProps = {
    title: string;
    description?: string;
    choices: string[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    onChange?: (e: {name: string, value: string | FileList | []}) => void;
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
                    <FormField type="checkbox" key={index}>
                        <Paragraph className="checkbox-field-label">
                            <FormLabel htmlFor={`${fieldKey}_${index}`} type="checkbox">
                                <Checkbox
                                    className="checkbox-field-input"
                                    id={`${fieldKey}_${index}`}
                                    name={fieldKey}
                                    value={choice}
                                    required={fieldRequired}
                                    checked={selectedChoices.includes(choice)}
                                    onChange={handleChoiceChange}
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

export default CheckboxField;
