import { FormValue } from '@openstad-headless/form/src/form';
import { Spacer } from '@openstad-headless/ui/src';
import {
  AccordionProvider,
  FormFieldDescription,
  FormLabel,
  Paragraph,
} from '@utrecht/component-library-react';
import React, { FC, useEffect, useState } from 'react';

import { InfoImage } from '../../infoImage';
import RteContent from '../../rte-formatting/rte-content';
import './style.css';

export type TickmarkSliderProps = {
  overrideDefaultValue?: FormValue;
  index: number;
  title: string;
  fieldOptions?: {
    value: string;
    label: string | React.JSX.Element;
    image?: { url: string; alt: string };
    ariaValueText?: string;
  }[];
  clickableSteps?: boolean;
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
  onChange?: (
    e: { name: string; value: FormValue },
    triggerSetLastKey?: boolean
  ) => void;
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
  confirmed?: boolean;
  optionFeedback?: Record<string, 'correct' | 'incorrect' | 'missed'>;
};

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
  clickableSteps = false,
  confirmed = false,
}) => {
  const defaultValue = Math.ceil(fieldOptions.length / 2).toString();
  const initialValue = overrideDefaultValue
    ? (overrideDefaultValue as string)
    : defaultValue;

  // ponytail: schaal-uitleg afleiden uit dezelfde labels die de schermlezer voorleest
  // (WCAG 3.3.2), zodat zichtbare instructie en aria-valuetext nooit uiteenlopen.
  const scaleHint = fieldOptions
    .filter((opt) => opt.ariaValueText)
    .map((opt) => `${opt.value} = ${opt.ariaValueText}`)
    .join(', ');

  const [value, setValue] = useState<string>(initialValue);

  const maxCharacters =
    fieldOptions.length > 0 ? fieldOptions.length.toString() : '1';

  class HtmlContent extends React.Component<{ html: any }> {
    render() {
      let { html } = this.props;
      return <RteContent content={html} unwrapSingleRootDiv={true} />;
    }
  }

  // Consider a field with an overrideDefaultValue as already answered when required
  const hasInitialValue = !!overrideDefaultValue;
  const [checkInvalid, setCheckInvalid] = useState<boolean>(
    fieldRequired && !hasInitialValue
  );

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
          <RteContent
            content={title}
            unwrapSingleRootDiv={true}
            forceInline={true}
          />
        </FormLabel>
      </Paragraph>
      {description && (
        <>
          <FormFieldDescription>
            <RteContent content={description} unwrapSingleRootDiv={true} />
          </FormFieldDescription>
          <Spacer size={0.5} />
        </>
      )}

      {scaleHint && (
        // ponytail: schaal-uitleg alleen voor schermlezers (WCAG 3.3.2) — de smileys/cijfers
        // zijn de zichtbare schaal, dus geen dubbele tekst in beeld.
        <span id={`${randomId}_scalehint`} className="sr-only">
          {scaleHint}
        </span>
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
              },
            ]}
          />
          <Spacer size={1.5} />
        </>
      )}

      {InfoImage({
        imageFallback: infoImage || '',
        imageAltFallback: imageAlt,
        imageDescriptionFallback: imageDescription,
        images: images,
        createImageSlider: createImageSlider,
        addSpacer: !!infoImage,
        imageClickable: imageClickable,
      })}

      {imageSrc && (
        <figure>
          <img src={imageSrc} alt={imageAlt} />
          {imageDescription && <figcaption>{imageDescription}</figcaption>}
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
        disabled={disabled || confirmed}
        aria-invalid={checkInvalid}
        aria-describedby={
          [
            scaleHint ? `${randomId}_scalehint` : '',
            // ponytail: fieldInvalid komt uit form.tsx en is alleen waar als
            // het foutelement daadwerkelijk gerenderd is. checkInvalid staat al
            // op waar bij "verplicht en nog leeg", dus dat wees naar niets.
            fieldInvalid ? `${randomId}_error` : '',
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        aria-valuetext={(() => {
          const opt = fieldOptions.find((opt) => opt.value === value);
          if (!opt) return value;
          if (opt.ariaValueText) return opt.ariaValueText;
          return typeof opt.label === 'string' ? opt.label : value;
        })()}
      />
      <div
        className={`range-slider-labels${showSmileys ? ' smiley-scale' : ''}${
          clickableSteps ? ' clickable-steps' : ''
        }`}
        {...(clickableSteps
          ? { role: 'group', 'aria-label': 'Antwoordopties' }
          : { 'aria-hidden': true })}>
        {fieldOptions.map((option, key) => {
          const isActive = value === option.value;

          if (!clickableSteps) {
            return (
              <span key={key} className={isActive ? 'active' : ''}>
                {option.label}
              </span>
            );
          }

          const stepFraction =
            fieldOptions.length > 1 ? key / (fieldOptions.length - 1) : 0;

          return (
            <button
              type="button"
              key={key}
              className={isActive ? 'active' : ''}
              style={{
                left: `calc(var(--scale-thumb-size, 30px) / 2 + ${stepFraction} * (100% - var(--scale-thumb-size, 30px)))`,
              }}
              aria-pressed={isActive}
              aria-label={
                option.image?.alt ||
                (typeof option.label === 'string' && option.label) ||
                `Stap ${option.value}`
              }
              disabled={disabled || confirmed}
              onClick={() => {
                setValue(option.value);
                setCheckInvalid(false);
                if (onChange) {
                  onChange({
                    name: fieldKey,
                    value: option.value,
                  });
                }
              }}>
              <span className="step-visual">
                {option.image && <img src={option.image.url} alt="" />}
                {option.label !== '' && option.label !== undefined && (
                  <span>{option.label}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TickmarkSlider;
