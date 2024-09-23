import {FormLabel, FormFieldDescription, Paragraph, AccordionProvider} from '@utrecht/component-library-react';
import React, { FC, useState } from 'react';
import { Spacer } from '@openstad-headless/ui/src';
import './style.css';

export type TickmarkSliderProps = {
    index: number;
    title: string;
    fieldOptions: { value: string; label: string }[];
    fieldRequired: boolean;
    fieldKey: string;
    imageSrc?: string;
    imageAlt?: string;
    imageDescription?: string;
    description?: string;
    disabled?: boolean;
    onChange?: (e: { name: string, value: string | Record<number, never> | [] }) => void;
    type?: string;
    showSmileys?: boolean;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
}

const TickmarkSlider: FC<TickmarkSliderProps> = ({
    title = '',
    description = '',
    fieldOptions = [],
    fieldRequired = false,
    showSmileys = false,
    fieldKey,
    imageSrc = '',
    imageAlt = '',
    imageDescription = '',
    onChange,
    index,
    disabled = false,
    showMoreInfo = false,
    moreInfoButton = 'Meer informatie',
    moreInfoContent = '',
   infoImage = '',
}) => {
    const defaultValue = Math.ceil(fieldOptions.length / 2).toString();
    const [value, setValue] = useState<string>(defaultValue);

    const maxCharacters = fieldOptions.length > 0 ? fieldOptions.length.toString() : "1";

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <div dangerouslySetInnerHTML={{__html: html}}/>;
        }
    }

    return (
        <div className="a-b-slider-container">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={`a-to-b-range--${index}`}>{title}</FormLabel>
            </Paragraph>
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

            {imageSrc && (
                <figure>
                    <img src={imageSrc} alt={imageAlt} />
                    {imageDescription && (
                        <figcaption>{imageDescription}</figcaption>
                    )}
                </figure>
            )}
            <input
                type="range"
                min="1"
                max={maxCharacters}
                value={value}
                step="1"
                id={`a-to-b-range--${index}`}
                name={fieldKey}
                required={fieldRequired}
                onChange={(e) => {
                    setValue(e.target.value);
                    if (onChange) {
                        onChange({
                            name: fieldKey,
                            value: e.target.value,
                        });
                    }
                }}
                disabled={disabled}
            />
            <div className={`range-slider-labels ${showSmileys && 'smiley-scale'}`} aria-hidden="true">
                {fieldOptions.map((option, key) => (
                    <span key={key} className={value === option.value ? 'active' : ''}>
                        {option.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default TickmarkSlider;
