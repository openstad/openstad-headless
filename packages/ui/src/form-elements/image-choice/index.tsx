import React, {FC, useEffect, useState} from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    RadioButton,
    Paragraph, FormFieldDescription, AccordionProvider, Checkbox
} from "@utrecht/component-library-react";
import { Spacer } from "../../spacer";
import { FormValue } from "@openstad-headless/form/src/form";

export type ImageChoiceFieldProps = {
    title: string;
    description?: string;
    choices: ChoiceItem[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: { name: string, value: FormValue }) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    multiple?: boolean;
    defaultValue?: string;
    prevPageTekst?: string;
    nextPageTekst?: string;
    fieldOptions?: { value: string; label: string }[];
}

export type ChoiceItem = {
    label: string;
    value: string;
    imageSrc: string;
    imageDescription: string;
    imageAlt: string;
    hideLabel?: boolean;
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
}) => {
    const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

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
    } , [selectedChoices]);

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let { html } = this.props;
            return <div dangerouslySetInnerHTML={{ __html: html }} />;
        }
    }

    const ChoiceComponent = multiple ? Checkbox : RadioButton;

    return (
        <div className={`question`}>
            <Fieldset
                aria-invalid={fieldInvalid}
                aria-describedby={`${randomId}_error`}
            >
                <FieldsetLegend>
                    {title}
                </FieldsetLegend>

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
                                                onChange={() => handleChoiceChange(choice.value)}
                                                disabled={disabled}
                                              />
                                                  {(choice.label && !choice.hideLabel) && (
                                                      choice.label
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
        </div>
    );
};

export default ImageChoiceField;
