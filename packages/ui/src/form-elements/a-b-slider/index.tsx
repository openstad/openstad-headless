import React, {FC, useEffect, useState} from 'react';
import './a-b-slider.css'
import {
    Accordion,
    AccordionProvider,
    AccordionSection,
    Checkbox, FormLabel,
    Paragraph,
    Strong
} from "@utrecht/component-library-react";
import { Spacer } from "../../spacer";
import TextInput from "../text";
import { FormValue } from "@openstad-headless/form/src/form";

export type RangeSliderProps = {
    title: string;
    description?: string;
    labelA: string;
    labelB: string;
    titleA: string;
    titleB: string;
    imageA: string;
    imageB: string;
    descriptionA?: string;
    descriptionB?: string;
    fieldRequired?: boolean;
    fieldKey: string;
    showLabels?: boolean;
    minCharacters?: number;
    maxCharacters?: number;
    disabled?: boolean;
    type?: string;
    onChange?: (e: { name: string, value: string | Record<number, never> | valueObject | [] }) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    skipQuestion?: boolean;
    skipQuestionAllowExplanation?: boolean;
    skipQuestionExplanation?: string;
    skipQuestionLabel?: string;
}

type valueObject = {value: string, skipQuestion: boolean, skipQuestionExplanation: string | undefined};

const RangeSlider: FC<RangeSliderProps> = ({
    title = '',
    description = '',
    labelA,
    labelB,
    titleA,
    titleB,
    descriptionA,
    descriptionB,
    imageA,
    imageB,
    fieldRequired = false,
    fieldKey,
    showLabels = true,
    onChange,
    disabled = false,
    showMoreInfo = false,
    moreInfoButton = 'Meer informatie',
    moreInfoContent = '',
    infoImage = '',
    randomId = '',
    fieldInvalid = false,
    skipQuestion = false,
    skipQuestionAllowExplanation = false,
    skipQuestionExplanation = '',
    skipQuestionLabel = 'Sla vraag over',
}) => {
    const [rangeValue, setRangeValue] = useState(undefined);
    const [skipSelected, setSkipSelected] = useState(false);
    const [fieldDisabled, setFieldDisabled] = useState(false);
    const [value, setValue] = useState<valueObject>({
        value: '50',
        skipQuestion: false,
        skipQuestionExplanation: ''
    });

    class HtmlContent extends React.Component<{ html: any, bold?: boolean }> {
        render() {
            let { html, bold = false } = this.props;

            if (bold) {
                html = `<strong>${html}</strong>`;
            }
            return <Paragraph dangerouslySetInnerHTML={{ __html: html }} />;
        }
    }

    const getSliderClass = (rangeValue?: number) => {
        if (rangeValue === undefined) return `slider-default`;
        if (rangeValue <= 50) return `slider-left`;
        return `slider-right`;
    };

    const changeValue = (key: 'value' | 'skipQuestion' | 'skipQuestionExplanation', newValue: any) => {
        const currValue: valueObject = {...value};

        if (key === 'value') {
            currValue.value = newValue as string;
        } else if (key === 'skipQuestion') {
            currValue.skipQuestion = newValue as boolean;
        } else if (key === 'skipQuestionExplanation') {
            currValue.skipQuestionExplanation = newValue as string | undefined;
        }

        if ( onChange ) {
            onChange({
                name: fieldKey,
                value: currValue,
            });
        }

        setValue(currValue);
    }

    useEffect(() => {
        setFieldDisabled(skipSelected);
        changeValue('skipQuestion', skipSelected);
    }, [skipSelected]);

    const handleInputChange = (event: { name: string, value: FormValue }) => {
        const { value } = event;
        changeValue('skipQuestionExplanation', value || '')
    };

    return (
        <div className="a-b-slider-container">
            {title && (
                <Paragraph><Strong>            <label htmlFor={randomId}>{title}</label></Strong></Paragraph>
            )}
            {description && (
                <HtmlContent html={description} />
            )}
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

            <div className="a-b-info-container">
                <div className="a-b-title label-a">
                    {showLabels && (<p className="label">A</p>)}
                    {(titleA || descriptionA || imageA) && (
                        <div className="a-b-info">
                            {titleA && <HtmlContent html={titleA} bold={true} />}
                            {descriptionA && <HtmlContent html={descriptionA} />}
                            {!!imageA && (<figure><img src={imageA} alt={`${titleA} - ${descriptionA}`} /></figure>)}
                        </div>
                    )}
                </div>
                <div className="a-b-title label-b">
                {showLabels && (<p className="label">B</p>)}
                    {(titleB || descriptionB || imageB) && (
                        <div className="a-b-info">
                            {titleB && <HtmlContent html={titleB} bold={true} />}
                            {descriptionB && <HtmlContent html={descriptionB} />}
                            {!!imageB && (<figure><img src={imageB} alt={`${titleB} - ${descriptionB}`} /></figure>)}
                        </div>
                    )}
                </div>
            </div>
            <div className='range-bar-container'>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    className="a-to-b-range"
                    name={fieldKey}
                    required={fieldRequired}
                    id={randomId}
                    onChange={(e) => {
                        setRangeValue(parseInt(e.target.value) as any);
                        changeValue('value', e.target.value);
                    }}
                    aria-label={`Selecteer een waarde tussen 1 en 100 voor ${titleA} en ${titleB}`}
                    disabled={disabled || fieldDisabled}
                    aria-invalid={fieldInvalid}
                    aria-describedby={`${randomId}_error`}
                />
                <div className={`slider_line-container ${getSliderClass(rangeValue)}`} data-range={rangeValue}>
                    <div
                        className="slider_line-container--bar"
                    />
                </div>
            </div>

            <Paragraph id="a-b-description" className="a-b-description visually-hidden">
                Deze slider vertegenwoordigt de waarde voor {titleA} aan de linkerkant en de waarde voor {titleB} aan de rechterkant.
            </Paragraph>
            <div className="a-b-label-container">
                <Paragraph className="a-b-label label-a">
                    {showLabels && (<span className="label">A.</span>)}
                    <span className="label">{labelA}</span>
                </Paragraph>
                <Paragraph className="a-b-label label-b">
                    {showLabels && (<span className="label">B.</span>)}
                    <span className="label">{labelB}</span>
                </Paragraph>
            </div>

            { (skipQuestion && skipQuestionAllowExplanation) && (
                <div className="skip-question-container">
                    <Spacer size={2} />
                    <FormLabel htmlFor={`${randomId}_skip`} type="checkbox" className="--label-grid">
                        <Checkbox
                          className="utrecht-form-field__input"
                          id={`${randomId}_skip`}
                          name={`${randomId}_skip`}
                          value={skipQuestionLabel}
                          required={false}
                          checked={skipSelected}
                          disabled={disabled}
                          onChange={() => {
                              setSkipSelected(!skipSelected);
                          }}
                        />
                        <span>{skipQuestionLabel}</span>
                    </FormLabel>

                    { skipSelected && (
                        <div className="marginTop10 marginBottom15">
                            <Spacer size={2} />
                            <TextInput
                                type="text"
                                onChange={handleInputChange}
                                fieldKey={`${randomId}_skip_explanation`}
                                title={skipQuestionExplanation}
                                fieldInvalid={false}
                                disabled={disabled}
                                variant="textarea"
                                rows={4}
                            />
                        </div>
                    )}

                </div>
            )}

        </div>
    );
}

export default RangeSlider;
