import React, { FC, useState } from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    RadioButton,
    Paragraph, FormFieldDescription, AccordionProvider,
} from "@utrecht/component-library-react";
import {Spacer} from "../../spacer";

export type ImageChoiceFieldProps = {
    title: string;
    description?: string;
    choices: ChoiceItem[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {name: string, value: string | Record<number, never> | []}) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
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
    showMoreInfo = false,
    moreInfoButton = 'Meer informatie',
    moreInfoContent = '',
   infoImage = '',
}) => {
    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    return (
        <div className="question">
            <Fieldset>
                <FieldsetLegend>
                    {title}
                </FieldsetLegend>

                {description &&
                  <FormFieldDescription dangerouslySetInnerHTML={{__html: description}} />
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
                        <Spacer size={.5} />
                    </>
                )}

                {infoImage && (
                    <figure className="info-image-container">
                        <img src={infoImage} alt=""/>
                        <Spacer size={.5} />
                    </figure>
                )}

                <div className={"image-choice-container"}>
                    {choices?.map((choice, index) => (
                        <FormField type="radio" key={index}>
                            <Paragraph className="utrecht-form-field__label utrecht-form-field__label--radio">
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
