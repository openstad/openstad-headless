import {FormLabel, FormFieldDescription, Paragraph, AccordionProvider} from '@utrecht/component-library-react';
import React, { FC, useEffect, useState } from 'react';
import { Spacer } from '@openstad-headless/ui/src';
import './style.css';
import { FormValue } from '@openstad-headless/form/src/form';
import {InfoImage} from "../../infoImage";
import RteContent from "../../rte-formatting/rte-content";

export type TickmarkSliderProps = {
    overrideDefaultValue?: FormValue;
    index: number;
    title: string;
    fieldOptions?: { value: string; label: string }[];
    images?: Array<{
        url: string;
        name?: string;
        imageAlt?: string;
        imageDescription?: string;
    }>;
    createImageSlider?: boolean;
    imageClickable?: boolean;
    fieldRequired: boolean;
    fieldKey: string;
    imageSrc?: string;
    imageAlt?: string;
    imageDescription?: string;
    description?: string;
    disabled?: boolean;
    onChange?: (e: { name: string, value: FormValue }, triggerSetLastKey?: boolean) => void;
    type?: string;
    showSmileys?: boolean;
    showMoreInfo?: boolean;
    moreInfoButton?: string;
    moreInfoContent?: string;
    infoImage?: string;
    randomId?: string;
    fieldInvalid?: boolean;
    defaultValue?: string;
    prevPageText?: string;
    nextPageText?: string;
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
    randomId = '',
    fieldInvalid = false,
    overrideDefaultValue,
    images = [],
    createImageSlider = false,
    imageClickable = false,
}) => {
    const defaultValue = Math.ceil(fieldOptions.length / 2).toString();
    const initialValue = overrideDefaultValue ? (overrideDefaultValue as string) : defaultValue;

    const [value, setValue] = useState<string>(initialValue);

    const maxCharacters = fieldOptions.length > 0 ? fieldOptions.length.toString() : "1";

    class HtmlContent extends React.Component<{ html: any }> {
        render() {
            let {html} = this.props;
            return <RteContent content={html} unwrapSingleRootDiv={true} />;
        }
    }

    // Consider a field with an overrideDefaultValue as already answered when required
    const hasInitialValue = !!overrideDefaultValue;
    const [checkInvalid, setCheckInvalid] = useState<boolean>(fieldRequired && !hasInitialValue);

    useEffect(() => {
        // If Form updates overrideDefaultValue later (e.g. when loading a draft),
        // clear invalid state for required fields that now have a value.
        if (fieldRequired && overrideDefaultValue) {
            setCheckInvalid(false);
        }
    }, [fieldRequired, overrideDefaultValue]);

    return (
        <div className="a-b-slider-container">
            <Paragraph className="utrecht-form-field__label">
                <FormLabel htmlFor={`a-to-b-range--${index}`}>
                    <RteContent content={title} unwrapSingleRootDiv={true} forceInline={true} />
                </FormLabel>
            </Paragraph>
            {description &&
                <>
                    <FormFieldDescription>
                        <RteContent content={description} unwrapSingleRootDiv={true} />
                    </FormFieldDescription>
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

            {InfoImage({
                imageFallback: infoImage || '',
                images: images,
                createImageSlider: createImageSlider,
                addSpacer: !!infoImage,
                imageClickable: imageClickable
            })}

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
                    setCheckInvalid(false);
                    if (onChange) {
                        onChange({
                            name: fieldKey,
                            value: e.target.value,
                        });
                    }
                }}
                disabled={disabled}
                aria-invalid={checkInvalid}
                aria-describedby={`${randomId}_error`}
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
