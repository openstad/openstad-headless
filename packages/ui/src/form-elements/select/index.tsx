import {
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
    Select,
    SelectOption
} from "@utrecht/component-library-react";
import React from "react";
import {FC} from "react";
import { Spacer } from '@openstad-headless/ui/src';

export type SelectFieldProps = {
    title?: string;
    description?: string;
    choices?: string[] | [{value: string, label: string}];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    defaultOption?: string;
    disabled?: boolean;
    onChange?: (e: {name: string, value: string | Record<number, never> | []}) => void;
    type?: string;
}

const SelectField: FC<SelectFieldProps> = ({
      title,
      description,
      choices = [],
      fieldKey,
      defaultOption = 'Selecteer een optie',
      fieldRequired= false,
      onChange,
      disabled = false,
}) => {
    choices = choices.map((choice) => {
      if (typeof choice === 'string') {
        return { value: choice, label: choice }
      } else {
        return choice;
      }
    }) as [{value: string, label: string}];
    return (
        <FormField type="select">
            <FormLabel htmlFor={fieldKey}>{title}</FormLabel>
            {description &&
                <>
                    <FormFieldDescription>
                        {description}
                    </FormFieldDescription>
                    <Spacer size={.5} />
                </>
            }
            <Paragraph className="utrecht-form-field__input">
                <Select
                    className="form-item"
                    name={fieldKey}
                    required={fieldRequired}
                    onChange={(e) => onChange ? onChange({
                        name: fieldKey,
                        value: e.target.value
                    }) : null }
                    disabled={disabled}
                >
                    <SelectOption value="">
                        {defaultOption}
                    </SelectOption>
                    {choices?.map((value, index) => (
                        <SelectOption value={value && value.value} key={index}>
                            {value && value.label}
                        </SelectOption>
                    ))}
                </Select>
            </Paragraph>
        </FormField>
    );
};

export default SelectField;
