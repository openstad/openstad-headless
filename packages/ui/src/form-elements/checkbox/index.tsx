import React, {FC, useEffect, useState} from "react";
import {
    Fieldset,
    FieldsetLegend,
    FormField,
    FormLabel,
    Checkbox,
    Paragraph, FormFieldDescription, AccordionProvider,
} from "@utrecht/component-library-react";
import { Spacer } from '@openstad-headless/ui/src';
import TextInput from "../text";
import { FormValue } from "@openstad-headless/form/src/form";

const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export type CheckboxFieldProps = {
    title: string;
    description?: string;
    choices?: { value: string, label: string, isOtherOption?: boolean, defaultValue?: boolean }[];
    fieldRequired?: boolean;
    requiredWarning?: string;
    fieldKey: string;
    disabled?: boolean;
    type?: string;
    onChange?: (e: {name: string, value: FormValue}, triggerSetLastKey?: boolean) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    maxChoices?: string,
    maxChoicesMessage?: string,
    randomId?: string;
    fieldInvalid?: boolean;
    defaultValue?: string;
    prevPageText?: string;
    nextPageText?: string;
    fieldOptions?: { value: string; label: string }[];
    randomizeItems?: boolean;
}

const CheckboxField: FC<CheckboxFieldProps> = ({
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
       maxChoices = '',
       maxChoicesMessage = '',
       randomId= '',
       fieldInvalid= false,
       randomizeItems = false,
}) => {
    const defaultSelectedChoices = choices?.filter((choice) => choice.defaultValue).map((choice) => choice.value) || [];
    const [selectedChoices, setSelectedChoices] = useState<string[]>(defaultSelectedChoices);
    const [otherOptionValues, setOtherOptionValues] = useState<{ [key: string]: string }>({});
    const [displayChoices, setDisplayChoices] = useState<typeof choices>([]);

    const maxChoicesNum = parseInt(maxChoices, 10) || 0;
    const maxReached = maxChoicesNum > 0 && selectedChoices.length >= maxChoicesNum;

    useEffect(() => {
        let normalizedChoices = choices ? choices.map(choice => typeof choice === 'string' ? {value: choice, label: choice} : choice) : [];

        if (randomizeItems) {
            console.log('Go Random!')
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
        if (onChange) {
            onChange({
                name: fieldKey,
                value: JSON.stringify(selectedChoices)
            });
        }
    } , [selectedChoices]);

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    const handleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>, index: number): void => {
        const choiceValue = event.target.value;
        if (event.target.checked) {
            setSelectedChoices([...selectedChoices, choiceValue]);
        } else {
            setSelectedChoices(selectedChoices.filter((choice) => choice !== choiceValue));
            if (otherOptionValues.hasOwnProperty(`${fieldKey}_${index}_other`)) {
                otherOptionValues[`${fieldKey}_${index}_other`] = "";
                setOtherOptionValues({ ...otherOptionValues });
                if (onChange) {
                    onChange({
                        name: `${fieldKey}_${index}_other`,
                        value: ""
                    }, false);
                }
            }
        }
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

    if (choices) {
        choices = choices.map((choice) => {
            if (typeof choice === 'string') {
                return { value: choice, label: choice }
            } else {
                return choice;
            }
        }) as [{ value: string, label: string, isOtherOption?: boolean, defaultValue?: boolean }];
    }

    return (
        <div className="question">
            <Fieldset
              role="group"
              aria-invalid={fieldInvalid}
              aria-describedby={`${randomId}_error`}
            >
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
                        <FormField type="checkbox" key={index}>
                            <Paragraph className="utrecht-form-field__label utrecht-form-field__label--checkbox">
                                <FormLabel htmlFor={`${fieldKey}_${index}`} type="checkbox" className="--label-grid">
                                    <Checkbox
                                        className="utrecht-form-field__input"
                                        id={`${fieldKey}_${index}`}
                                        name={fieldKey}
                                        value={choice && choice.value}
                                        required={fieldRequired}
                                        checked={choice && choice.value ? selectedChoices.includes(choice.value) : false}
                                        onChange={(e) => handleChoiceChange(e, index)}
                                        disabled={disabled || (maxReached && !selectedChoices.includes(choice.value))}
                                    />
                                    <span>{choice && choice.label}</span>
                                </FormLabel>
                            </Paragraph>
                        </FormField>

                        {choice.isOtherOption && selectedChoices.includes(choice.value) && (
                            <div className="marginTop10 marginBottom15">
                                <TextInput
                                    type="text"
                                    // @ts-ignore
                                    onChange={(e: { name: string; value: string }) => handleOtherOptionChange(e)}
                                    fieldKey={`${fieldKey}_${index}_other`}
                                    title=""
                                    defaultValue={otherOptionValues[`${fieldKey}_${index}_other`]}
                                    fieldInvalid={false}
                                    randomId={`${fieldKey}_${index}`}
                                />
                            </div>
                        )}
                    </>
                ))}

                {maxReached && maxChoicesMessage && (
                  <em aria-live="polite">{maxChoicesMessage}</em>
                )}
            </Fieldset>
        </div>
    );
};

export default CheckboxField;
