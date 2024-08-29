import { FormLabel, FormFieldDescription , Paragraph} from '@utrecht/component-library-react';
import React, { FC, useState } from 'react';
import { Spacer } from '@openstad-headless/ui/src';
import './style.css';

export type TickmarkSliderProps = {
    index: number;
    title: string;
    fieldOptions: { value: string; label: string }[];
    fieldRequired: boolean;
    fieldKey: string;
    imageSrc?: string;
    imageAlt?: string;
    imageDescription?: string;
    description?: string;
    disabled?: boolean;
    onChange?: (e: { name: string, value: string | Record<number, never> | [] }) => void;
    type?: string;
    showSmileys?: boolean;
}

const TickmarkSlider: FC<TickmarkSliderProps> = ({
    title = '',
    description = '',
    fieldOptions = [],
    fieldRequired = false,
    showSmileys = false,
    fieldKey,
    imageSrc = '',
    imageAlt = '',
    imageDescription = '',
    onChange,
    index,
    disabled = false,
}) => {
    const defaultValue = Math.ceil(fieldOptions.length / 2).toString();
    const [value, setValue] = useState<string>(defaultValue);

    const maxCharacters = fieldOptions.length > 0 ? fieldOptions.length.toString() : "1";

    return (
        <div className="a-b-slider-container">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={`a-to-b-range--${index}`}>{title}</FormLabel>
            </Paragraph>
            {description &&
                    <>
                    <FormFieldDescription>
                        {description}
                    </FormFieldDescription>
                    <Spacer size={.5} />
                </>
            }
            {imageSrc && (
                <figure>
                    <img src={imageSrc} alt={imageAlt} />
                    {imageDescription && (
                        <figcaption>{imageDescription}</figcaption>
                    )}
                </figure>
            )}
            <input
                type="range"
                min="1"
                max={maxCharacters}
                value={value}
                step="1"
                id={`a-to-b-range--${index}`}
                name={fieldKey}
                required={fieldRequired}
                onChange={(e) => {
                    setValue(e.target.value);
                    if (onChange) {
                        onChange({
                            name: fieldKey,
                            value: e.target.value,
                        });
                    }
                }}
                aria-label={`Selecteer een waarde tussen 1 en ${fieldOptions.length}`}
                disabled={disabled}
            />
            <div className={`range-slider-labels ${showSmileys && 'smiley-scale'}`}>
                {fieldOptions.map((option, key) => (
                    <label key={key} htmlFor={`a-to-b-range--${index}`} className={value === option.value ? 'active' : ''}>
                        {option.label}
                    </label>
                ))}
            </div>
        </div>
    );
}

export default TickmarkSlider;
