import {
    FormField,
    FormFieldDescription,
    FormLabel,
    Paragraph,
    Select,
    SelectOption
} from "@utrecht/component-library-react";
import { SelectFieldProps } from "./props";
import {FC, useState} from "react";

const SelectField: FC<SelectFieldProps> = ({
      title,
      description,
      choices = [],
      fieldName,
      defaultOption = 'Selecteer een optie',
      fieldRequired= false,
      requiredWarning= 'Dit veld is verplicht.'
}) => {
    const randomID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const isValid = (selectedValue: string): boolean => {
        if (fieldRequired && selectedValue.trim() === '') {
            setErrorMessage(requiredWarning);
            return false;
        }

        setErrorMessage(undefined);
        return true;
    };

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        const selectedValue = event.target.value;
        isValid(selectedValue);
    };

    return (
        <FormField invalid={!!errorMessage} type="text">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={randomID}>{title}</FormLabel>
                <FormFieldDescription>{description}</FormFieldDescription>
            </Paragraph>
            <Paragraph className="utrecht-form-field__input">
                <Select
                    className="form-item"
                    name={fieldName}
                    required={fieldRequired}
                    onChange={handleChange}
                >
                    <SelectOption disabled value="">
                        {defaultOption}
                    </SelectOption>
                    {choices?.map((value, index) => (
                        <SelectOption value={value} key={index}>
                            {value}
                        </SelectOption>
                    ))}
                </Select>
                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}
            </Paragraph>
        </FormField>
    );
};

export default SelectField;
