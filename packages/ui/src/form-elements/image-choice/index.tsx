import React, { FC, useState } from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    RadioButton,
    Paragraph, FormFieldDescription,
} from "@utrecht/component-library-react";

export type ImageChoiceFieldProps = {
    title: string;
    description?: string;
    choices: ChoiceItem[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    onChange?: (e: {name: string, value: string | string[] | []}) => void;
}

export type ChoiceItem = {
    label: string;
    value: string;
    imageSrc: string;
    imageDescription: string;
    imageAlt: string;
}

const ImageChoiceField: FC<ImageChoiceFieldProps> = ({
    title,
    description,
    choices,
    fieldRequired = false,
    fieldKey,
    onChange,
    disabled = false,
}) => {
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

                <div className={"image-choice-container"}>
                    {choices?.map((choice, index) => (
                        <FormField type="radio" key={index}>
                            <Paragraph className="radio-field-label">
                                <FormLabel htmlFor={`${fieldKey}_${index}`} type="radio">
                                    <RadioButton
                                        className="radio-field-input"
                                        id={`${fieldKey}_${index}`}
                                        name={fieldKey}
                                        required={fieldRequired}
                                        onChange={() => onChange ? onChange({
                                            name: fieldKey,
                                            value: choice.value
                                        }) : null}
                                        disabled={disabled}
                                    />
                                    <figure>
                                        <img src={choice.imageSrc} alt={choice.imageAlt} />
                                        {choice.label && (
                                            <figcaption>{choice.label}</figcaption>
                                        )}
                                    </figure>
                                </FormLabel>
                            </Paragraph>
                        </FormField>
                    ))}
                </div>
            </Fieldset>
        </div>
    );
};

export default ImageChoiceField;
