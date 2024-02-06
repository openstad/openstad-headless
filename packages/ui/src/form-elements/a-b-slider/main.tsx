import React, {FC, useState} from 'react';
import { RangeSliderProps } from "./props";

const RangeSlider: FC<RangeSliderProps> = ({
    question= '',
    description= '',
    labelA,
    labelB,
    titleA,
    titleB,
    descriptionA,
    descriptionB,
    fieldRequired= false,
    fieldKey,
    showLabels = true,
    onChange
}) => {
    return (
        <div className="a-b-slider-container">
            {question && (
                <h3 className="a-b-question">{question}</h3>
            )}
            {description && (
                <p>{description}</p>
            )}
            <div className="a-b-info-container">
                <div className="a-b-title label-a">
                    {showLabels && (<p className="label">A</p>)}
                    <div className="a-b-info">
                        <p className="title">{titleA}</p>
                        <p className="description">{descriptionA}</p>
                    </div>
                </div>
                <div className="a-b-title label-b">
                    {showLabels && (<p className="label">B</p>)}
                    <div className="a-b-info">
                        <p className="title">{titleB}</p>
                        <p className="description">{descriptionB}</p>
                    </div>
                </div>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                step="1"
                id="a-to-b-range"
                name={fieldKey}
                required={fieldRequired}
                onChange={(e) => {
                    onChange({
                        name: fieldKey,
                        value: e.target.value,
                    });
                }}
                aria-label={`Selecteer een waarde tussen 1 en 100 voor ${titleA} en ${titleB}`}
            />
            <p id="a-b-description" className="a-b-description visually-hidden">
                Deze slider vertegenwoordigt de waarde voor {titleA} aan de linkerkant en de waarde voor {titleB} aan de rechterkant.
            </p>
            <div className="a-b-label-container">
                <p className="a-b-label label-a">
                    {showLabels && (<span className="label">A.</span>)}
                    <span className="label">{labelA}</span>
                </p>
                <p className="a-b-label label-b">
                    {showLabels && (<span className="label">B.</span>)}
                    <span className="label">{labelB}</span>
                </p>
            </div>
        </div>
    );
}

export default RangeSlider;