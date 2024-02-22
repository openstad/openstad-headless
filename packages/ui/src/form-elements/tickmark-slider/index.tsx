import React, { FC, useState } from 'react';

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
    onChange?: (e: {name: string, value: string}) => void;
}

const TickmarkSlider: FC<TickmarkSliderProps> = ({
     title= '',
     description = '',
     fieldOptions = [],
     fieldRequired = false,
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
            {title && (
                <h3 className="a-b-question">{title}</h3>
            )}
            {description && (
                <p>{description}</p>
            )}
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
                list={`form-field-tickmarks-${index}`}
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
            <datalist id={`form-field-tickmarks-${index}`}>
                {fieldOptions.map((option, key) => (
                    <option key={key} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </datalist>
            <div className="range-slider-labels">
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
