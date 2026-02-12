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
import {InfoImage} from "../../infoImage";
import RteContent from "../../rte-formatting/rte-content";

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
    images?: Array<{
        url: string;
        name?: string;
        imageAlt?: string;
        imageDescription?: string;
    }>;
    createImageSlider?: boolean;
    imageClickable?: boolean;
    infoField?: string;
    maxChoices?: string;
    maxChoicesMessage?: string;
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
    images = [],
    createImageSlider = false,
    imageClickable = false,
    maxChoices,
    maxChoicesMessage,
}) => {
    let initialValue = [];

    try {
        initialValue = overrideDefaultValue ? JSON.parse(overrideDefaultValue as string) : [];
    } catch (e) {}

    const [selectedChoices, setSelectedChoices] = useState<string[]>(initialValue);
    const [isInfoVisible, setIsInfoVisible] = useState(false);

    const maxChoicesNum = parseInt(maxChoices || '', 10) || 0;
    const maxReached = multiple && maxChoicesNum > 0 && selectedChoices.length >= maxChoicesNum;

    const handleChoiceChange = (choiceValue: string) => {
        if (!multiple) {
            setSelectedChoices([choiceValue]);
        } else {
            setSelectedChoices((prev) => {
                if (prev.includes(choiceValue)) {
                    return prev.filter((choice) => choice !== choiceValue);
                }
                if (maxChoicesNum > 0 && prev.length >= maxChoicesNum) {
                    return prev;
                }
                return [...prev, choiceValue];
            });
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
            return <RteContent content={html} unwrapSingleRootDiv={true} />;
        }
    }

    const ChoiceComponent = multiple ? Checkbox : RadioButton;

    const hasInitialSelection = selectedChoices.length > 0;
    const [checkInvalid, setCheckInvalid] = useState(fieldRequired && !hasInitialSelection);

    useEffect(() => {
        if (fieldRequired && selectedChoices.length > 0) {
            setCheckInvalid(false);
        }
    }, [fieldRequired, selectedChoices]);

    return (
        <div className={`question`}>
            <Fieldset
                aria-invalid={checkInvalid}
                aria-describedby={`${randomId}_error`}
            >
                {title && (
                    <FieldsetLegend>
                        <RteContent content={title} unwrapSingleRootDiv={true} forceInline={true} />
                    </FieldsetLegend>
                )}

                {description &&
                    <FormFieldDescription>
                        <RteContent content={description} unwrapSingleRootDiv={true} />
                    </FormFieldDescription>
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

                {InfoImage({
                    imageFallback: infoImage || '',
                    images: images,
                    createImageSlider: createImageSlider,
                    addSpacer: !!infoImage,
                    imageClickable: imageClickable
                })}

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
                                                    disabled={disabled || (maxReached && !selectedChoices.includes(choice.value))}
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
                                                        <RteContent content={choice.description} inlineComponent={Paragraph} unwrapSingleRootDiv={true} />
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
                {maxReached && maxChoicesMessage && (
                    <em aria-live="polite">{maxChoicesMessage}</em>
                )}
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
