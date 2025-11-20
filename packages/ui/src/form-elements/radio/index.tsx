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
import { FormValue } from "@openstad-headless/form/src/form";

const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export type RadioboxFieldProps = {
    title: string;
    overrideDefaultValue?: FormValue;
    description?: string;
    choices?: { value: string, label: string, isOtherOption?: boolean, defaultValue?: boolean }[];
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
    defaultValue?: string;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: { value: string; label: string }[];
    randomizeItems?: boolean;
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
    randomId = '',
    fieldInvalid = false,
    randomizeItems = false,
    overrideDefaultValue,
    defaultValue
}) => {
    let initialValue = defaultValue as string || "";
    initialValue = overrideDefaultValue ? (overrideDefaultValue as string) : "";

    const [selectedOption, setSelectedOption] = useState<string>(initialValue);
    const [otherOptionValues, setOtherOptionValues] = useState<{ [key: string]: string }>({});
    const [displayChoices, setDisplayChoices] = useState<typeof choices>([]);

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    useEffect(() => {
        let normalizedChoices = choices ? choices.map(choice => typeof choice === 'string' ? {value: choice, label: choice} : choice) : [];

        if (randomizeItems) {
            const storageKey = `randomizedChoices_${fieldKey}`;
            const stored = sessionStorage.getItem(storageKey);
            if (stored) {
                setDisplayChoices(JSON.parse(stored));
            } else {
                const shuffled = shuffleArray(normalizedChoices);
                setDisplayChoices(shuffled);
                sessionStorage.setItem(storageKey, JSON.stringify(shuffled));
            }
        } else {
            setDisplayChoices(normalizedChoices);
        }
    }, [choices, fieldKey, randomizeItems]);

    useEffect(() => {
        const initialOtherOptionValues: { [key: string]: string } = {};
        displayChoices?.forEach((choice, index) => {
            if (choice?.isOtherOption) {
                initialOtherOptionValues[`${fieldKey}_${index}_other`] = "";
            }
        });
        setOtherOptionValues(initialOtherOptionValues);
    }, [displayChoices, fieldKey]);

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
                    }, false);
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
            }, false);
        }
    };

    return (
        <div className="question">
            <Fieldset
                role="radiogroup"
                aria-invalid={fieldInvalid}
                aria-describedby={`${randomId}_error`}
            >
                {title && (
                    <FieldsetLegend dangerouslySetInnerHTML={{ __html: title }} />
                )}

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
                        <Spacer size={1.5} />
                    </>
                )}

                {infoImage && (
                    <figure className="info-image-container">
                        <img src={infoImage} alt=""/>
                        <Spacer size={.5} />
                    </figure>
                )}

                {displayChoices?.map((choice, index) => (
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
                                        checked={selectedOption === choice.value}
                                    />
                                    <span>{choice && choice.label}</span>
                                </FormLabel>
                            </Paragraph>
                        </FormField>
                        {choice.isOtherOption && selectedOption === choice.value && (
                            <div className="marginTop10 marginBottom15">
                                <TextInput
                                    type="text"
                                    // @ts-ignore
                                    onChange={(e: { name: string; value: string }) => handleOtherOptionChange(e)}
                                    fieldKey={`${fieldKey}_${index}_other`}
                                    title=""
                                    fieldInvalid={false}
                                    randomId={`${fieldKey}_${index}`}
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
