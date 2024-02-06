import React, {FC, useEffect, useState} from "react";
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
       fieldKey,
       onChange
}) => {
    const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

    useEffect(() => {
        onChange({
            name: fieldKey,
            value: JSON.stringify(selectedChoices)
        });
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
                    {question}
                    {description && <p>{description}</p>}
                </FieldsetLegend>

                {choices.map((choice, index) => (
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
