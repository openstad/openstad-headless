import React, { FC, useState } from 'react';

export type TickmarkSliderProps = {
    question: string;
    fieldOptions: { value: string; label: string }[];
    fieldRequired: boolean;
    fieldKey: string;
    imageSrc?: string;
    imageAlt?: string;
    imageDescription?: string;
    description?: string;
    disabled?: boolean;
}

const TickmarkSlider: FC<TickmarkSliderProps> = ({
     question= '',
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
            {question && (
                <h3 className="a-b-question">{question}</h3>
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
                    onChange({
                        name: fieldKey,
                        value: e.target.value,
                    });
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
        </div>
    );
}

export default TickmarkSlider;
