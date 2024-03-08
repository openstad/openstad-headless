import {
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
    Select,
    SelectOption
} from "@utrecht/component-library-react";
import {FC} from "react";

export type SelectFieldProps = {
    title?: string;
    description?: string;
    choices?: string[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    defaultOption?: string;
    disabled?: boolean;
    onChange: (e: {name: string, value: string}) => void;
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
    return (
        <FormField type="select">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={fieldKey}>{title}</FormLabel>
            </Paragraph>
            <FormFieldDescription>{description}</FormFieldDescription>
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
                        <SelectOption value={value} key={index}>
                            {value}
                        </SelectOption>
                    ))}
                </Select>
            </Paragraph>
        </FormField>
    );
};

export default SelectField;
