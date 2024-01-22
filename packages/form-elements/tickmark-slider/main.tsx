import React, { FC, useState } from 'react';
import { TickmarkSliderProps } from "./props";

const TickmarkSlider: FC<TickmarkSliderProps> = ({
     question= '',
     description = '',
     fieldOptions = [],
     fieldRequired = false,
     fieldKey,
     imageSrc = '',
     imageAlt = '',
     imageDescription = '',
}) => {
    const defaultValue = Math.ceil(fieldOptions.length / 2).toString();
    const [value, setValue] = useState<string>(defaultValue);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);

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
                list="tickmarks"
                id="a-to-b-range"
                name={fieldKey}
                required={fieldRequired}
                onChange={(e) => {
                    setValue(e.target.value);
                    if (!isAnswered) {
                        setIsAnswered(true);
                    }
                }}
                aria-label={`Selecteer een waarde tussen 1 en ${fieldOptions.length}`}
            />
            <datalist id="tickmarks">
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
