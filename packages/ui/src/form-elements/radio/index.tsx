import React, { FC, useState } from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    RadioButton,
    Paragraph,
    FormFieldDescription, AccordionProvider
} from "@utrecht/component-library-react";
import { Spacer } from '@openstad-headless/ui/src';
import TextInput from "../text";
import { useEffect } from "react";

export type RadioboxFieldProps = {
    title: string;
    description?: string;
    choices?: { value: string, label: string, isOtherOption?: boolean }[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: { name: string, value: string | Record<number, never> | [] }) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
}

const RadioboxField: FC<RadioboxFieldProps> = ({
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
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [otherOptionValues, setOtherOptionValues] = useState<{ [key: string]: string }>({});

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    useEffect(() => {
        const initialOtherOptionValues: { [key: string]: string } = {};
        choices?.forEach((choice, index) => {
            if (choice.isOtherOption) {
                initialOtherOptionValues[`${fieldKey}_${index}_other`] = "";
            }
        });
        setOtherOptionValues(initialOtherOptionValues);
    }, [choices, fieldKey]);

    const handleRadioChange = (value: string, index: number) => {
        setSelectedOption(value);
        if (onChange) {
            onChange({
                name: fieldKey,
                value: value
            });
        }
        Object.keys(otherOptionValues).forEach((key) => {
            if (key !== `${fieldKey}_${index}_other`) {
                otherOptionValues[key] = "";
                if (onChange) {
                    onChange({
                        name: key,
                        value: ""
                    });
                }
            }
        });
        setOtherOptionValues({ ...otherOptionValues });
    };

    const handleOtherOptionChange = (e: { name: string, value: string }) => {
        setOtherOptionValues({
            ...otherOptionValues,
            [e.name]: e.value
        });
        if (onChange) {
            onChange({
                name: e.name,
                value: e.value
            });
        }
    };

    if (choices) {
        choices = choices.map((choice) => {
            if (typeof choice === 'string') {
                return {value: choice, label: choice}
            } else {
                return choice;
            }
        }) as [{ value: string, label: string, isOtherOption?: boolean }];
    }

    return (
        <div className="question">
            <Fieldset role="radiogroup">
                <FieldsetLegend>
                    {title}
                </FieldsetLegend>

                {description &&
                    <>
                        <FormFieldDescription dangerouslySetInnerHTML={{__html: description}} />
                        <Spacer size={.5} />
                    </>
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

                {choices?.map((choice, index) => (
                    <>
                        <FormField type="radio" key={index}>
                            <Paragraph className="utrecht-form-field__label utrecht-form-field__label--radio">
                                <FormLabel htmlFor={`${fieldKey}_${index}`} type="radio" className="--label-grid">
                                    <RadioButton
                                        className="utrecht-form-field__input"
                                        id={`${fieldKey}_${index}`}
                                        name={fieldKey}
                                        required={fieldRequired}
                                        onChange={() => handleRadioChange(choice.value, index)}
                                        disabled={disabled}
                                        value={choice && choice.value}
                                    />
                                    <span>{choice && choice.label}</span>
                                </FormLabel>
                            </Paragraph>
                        </FormField>
                        {choice.isOtherOption && selectedOption === choice.value && (
                            <div style={{marginTop: '10px', marginBottom: '15px'}}>
                                <TextInput
                                    type="text"
                                    // @ts-ignore
                                    onChange={(e: { name: string; value: string }) => handleOtherOptionChange(e)}
                                    fieldKey={`${fieldKey}_${index}_other`}
                                    title=""
                                />
                            </div>
                        )}
                    </>
                ))}
            </Fieldset>
        </div>
    );
};

export default RadioboxField;
