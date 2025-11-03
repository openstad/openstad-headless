import React, { FC, useEffect, useState } from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    RadioButton,
    Paragraph, FormFieldDescription, AccordionProvider, Checkbox,
    Heading,
    Button
} from "@utrecht/component-library-react";
import { Spacer } from "../../spacer";
import { FormValue } from "@openstad-headless/form/src/form";

export type ImageChoiceFieldProps = {
    title: string;
    overrideDefaultValue?: FormValue;
    description?: string;
    choices: ChoiceItem[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: { name: string, value: FormValue }, triggerSetLastKey?: boolean) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    multiple?: boolean;
    defaultValue?: string;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: { value: string; label: string }[];
    infoField?: string;
}

export type ChoiceItem = {
    label: string;
    value: string;
    imageSrc: string;
    imageDescription: string;
    imageAlt: string;
    hideLabel?: boolean;
    description?: string;
}

const ImageChoiceField: FC<ImageChoiceFieldProps> = ({
    title,
    description,
    choices,
    fieldRequired = false,
    fieldKey,
    onChange,
    disabled = false,
    showMoreInfo = false,
    moreInfoButton = 'Meer informatie',
    moreInfoContent = '',
    infoImage = '',
    randomId = '',
    fieldInvalid = false,
    multiple = false,
    overrideDefaultValue,
    infoField,
}) => {
    let initialValue = [];

    try {
        initialValue = overrideDefaultValue ? JSON.parse(overrideDefaultValue as string) : [];
    } catch (e) {}

    const [selectedChoices, setSelectedChoices] = useState<string[]>(initialValue);
    const [isInfoVisible, setIsInfoVisible] = useState(false);

    const handleChoiceChange = (choiceValue: string) => {
        if (!multiple) {
            setSelectedChoices([choiceValue]);
        } else if (!selectedChoices.includes(choiceValue)) {
            setSelectedChoices([...selectedChoices, choiceValue]);
        } else {
            setSelectedChoices(selectedChoices.filter((choice) => choice !== choiceValue));
        }
    };

    useEffect(() => {
        if (onChange) {
            onChange({
                name: fieldKey,
                value: JSON.stringify(selectedChoices)
            });
        }
    }, [selectedChoices]);

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let { html } = this.props;
            return <div dangerouslySetInnerHTML={{ __html: html }} />;
        }
    }

    const ChoiceComponent = multiple ? Checkbox : RadioButton;

    const [checkInvalid, setCheckInvalid] = useState(fieldRequired);

    return (
        <div className={`question`}>
            <Fieldset
                aria-invalid={checkInvalid}
                aria-describedby={`${randomId}_error`}
            >
                {title && (
                    <FieldsetLegend dangerouslySetInnerHTML={{ __html: title }} />
                )}

                {description &&
                    <FormFieldDescription dangerouslySetInnerHTML={{ __html: description }} />
                }

                {showMoreInfo && (
                    <>
                        <AccordionProvider
                            sections={[
                                {
                                    headingLevel: 3,
                                    body: <HtmlContent html={moreInfoContent} />,
                                    expanded: undefined,
                                    label: moreInfoButton,
                                }
                            ]}
                        />
                        <Spacer size={1.5} />

                    </>
                )}

                {infoImage && (
                    <figure className="info-image-container">
                        <img src={infoImage} alt="" />
                        <Spacer size={.5} />
                    </figure>
                )}

                <div className={"image-choice-container"}>
                    {choices?.map((choice, index) => {
                        const isSelected = choice && choice.label ? selectedChoices.includes(choice.label) : false;
                        return (
                            <FormField type="radio" key={index}>
                                <Paragraph className="utrecht-form-field__label utrecht-form-field__label--radio">
                                    <FormLabel htmlFor={`${fieldKey}_${index}`} type="radio" className={isSelected ? "selected" : ""}>
                                        <figure>
                                            <img src={choice.imageSrc} alt={choice.imageAlt} />
                                            <figcaption>
                                                <ChoiceComponent
                                                    className="radio-field-input"
                                                    id={`${fieldKey}_${index}`}
                                                    name={fieldKey}
                                                    required={fieldRequired}
                                                    onChange={() => { handleChoiceChange(choice.value), setCheckInvalid(false) }}
                                                    disabled={disabled}
                                                checked={choice && choice.value ? selectedChoices.includes(choice.value) : false}
                                                />
                                                {(choice.label && !choice.hideLabel && !choice.description) && (
                                                    choice.label
                                                )}
                                                {(choice.description && choice.label && !choice.hideLabel) && (
                                                    <>
                                                        <Heading level={4}>
                                                            {choice.label}
                                                        </Heading>
                                                        <Paragraph dangerouslySetInnerHTML={{ __html: choice.description }}></Paragraph>
                                                    </>

                                                )}
                                            </figcaption>
                                        </figure>
                                    </FormLabel>
                                </Paragraph>
                            </FormField>
                        );
                    })}

                </div>
            </Fieldset>
            {infoField && (
                <div className="extra-info-container">
                    <button
                        className="more-info-btn"
                        onClick={(e) => { setIsInfoVisible(!isInfoVisible); e.preventDefault(); }}
                    >Info</button>
                    <div className="info-card" aria-hidden={!isInfoVisible ? 'true' : 'false'} onClick={() => { setIsInfoVisible(false); }}>
                        <div className="info-card-container">
                            <Paragraph>
                                {infoField}
                            </Paragraph>

                            <Button appearance="primary-action-button" onClick={() => { setIsInfoVisible(false); }}>Snap ik</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageChoiceField;
