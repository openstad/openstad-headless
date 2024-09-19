import React, { FC, useState } from 'react';
import './a-b-slider.css'
import {Accordion, AccordionProvider, AccordionSection, Paragraph, Strong} from "@utrecht/component-library-react";
import {Spacer} from "../../spacer";

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
    onChange?: (e: { name: string, value: string | Record<number, never> | [] }) => void;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
}


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
}) => {
    const randomId = Math.random().toString(36).substring(7);
    const [rangeValue, setRangeValue] = useState(undefined);

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <Paragraph dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    return (
        <div className="a-b-slider-container">
            {title && (
                <Paragraph><Strong>            <label htmlFor={randomId}>{title}</label></Strong></Paragraph>
            )}
            {description && (
                <Paragraph dangerouslySetInnerHTML={{__html: description}}></Paragraph>
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
                    <Spacer size={.5} />
                </>
            )}

            {infoImage && (
                <figure className="info-image-container">
                    <img src={infoImage} alt=""/>
                    <Spacer size={.5} />
                </figure>
            )}

            <div className="a-b-info-container">
                <div className="a-b-title label-a">
                    {showLabels && (<p className="label">A</p>)}
                    <div className="a-b-info">
                        <Paragraph><Strong>{titleA}</Strong></Paragraph>
                        <Paragraph>{descriptionA}</Paragraph>
                        {!!imageA && (<figure><img src={imageA} alt={`${titleA} - ${descriptionA}`} /></figure>)}
                    </div>
                </div>
                <div className="a-b-title label-b">
                    {showLabels && (<p className="label">B</p>)}
                    <div className="a-b-info">
                        <Paragraph><Strong>{titleB}</Strong></Paragraph>
                        <Paragraph>{descriptionB}</Paragraph>
                        {!!imageB && (<figure><img src={imageB} alt={`${titleB} - ${descriptionB}`} /></figure>)}
                    </div>
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
                        if (onChange) {
                            onChange({
                                name: fieldKey,
                                value: e.target.value,
                            });
                        }
                    }}
                    aria-label={`Selecteer een waarde tussen 1 en 100 voor ${titleA} en ${titleB}`}
                    disabled={disabled}
                />
                <div className="slider_line-container"
                    style={{
                        marginLeft: rangeValue !== undefined ? rangeValue <= 50 ? '0' : '50%' : '0',
                        transform: rangeValue !== undefined ? rangeValue <= 50 ? 'rotate(180deg) translateX(50%)' : 'rotate(0) translateX(0)' : '0',
                        marginTop: `-24px`,
                        pointerEvents: 'none',
                        height: '8px',
                    }}
                >
                    <div
                        className="slider_line-container--bar"
                        style={{
                            width: rangeValue !== undefined ? rangeValue <= 50 ? `${(50 - rangeValue)}%` : `${(rangeValue - 50) * 2}%` : '0%',
                            height: '8px',
                            backgroundColor: '#1371EF',
                        }}
                    ></div>
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
        </div>
    );
}

export default RangeSlider;
