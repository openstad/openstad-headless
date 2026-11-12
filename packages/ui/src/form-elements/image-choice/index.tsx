import { FormValue } from '@openstad-headless/form/src/form';
import { toHtmlId } from '@openstad-headless/lib/to-html-id';
import {
  AccordionProvider,
  Button,
  Checkbox,
  Fieldset,
  FieldsetLegend,
  FormField,
  FormFieldDescription,
  FormLabel,
  Paragraph,
  RadioButton,
} from '@utrecht/component-library-react';
import React, { FC, useEffect, useRef, useState } from 'react';

import { ClickableImage } from '../../clickable-image';
import { InfoImage } from '../../infoImage';
import RteContent, { InlineParagraph } from '../../rte-formatting/rte-content';
import { Spacer } from '../../spacer';
import { FormFieldLabel } from '../form-field-label';
import './index.css';

export type ImageChoiceFieldProps = {
  title: string;
  overrideDefaultValue?: FormValue;
  description?: string;
  choices: ChoiceItem[];
  fieldRequired?: boolean;
  requiredWarning?: string;
  fieldKey: string;
  disabled?: boolean;
  type?: string;
  onChange?: (
    e: { name: string; value: FormValue; isInitial?: boolean },
    triggerSetLastKey?: boolean
  ) => void;
  showMoreInfo?: boolean;
  moreInfoButton?: string;
  moreInfoContent?: string;
  infoImage?: string;
  randomId?: string;
  fieldInvalid?: boolean;
  multiple?: boolean;
  defaultValue?: string;
  prevPageText?: string;
  nextPageText?: string;
  fieldOptions?: { value: string; label: string }[];
  images?: Array<{
    url: string;
    name?: string;
    imageAlt?: string;
    imageDescription?: string;
  }>;
  createImageSlider?: boolean;
  imageClickable?: boolean;
  infoField?: string;
  maxChoices?: string;
  maxChoicesMessage?: string;
};

export type ChoiceItem = {
  label: string;
  value: string;
  imageSrc: string;
  imageDescription: string;
  imageAlt: string;
  hideLabel?: boolean;
  description?: string;
};

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
  overrideDefaultValue,
  infoField,
  images = [],
  createImageSlider = false,
  imageClickable = false,
  maxChoices,
  maxChoicesMessage,
}) => {
  const idKey = toHtmlId(fieldKey);

  let initialValue = [];

  try {
    initialValue = overrideDefaultValue
      ? JSON.parse(overrideDefaultValue as string)
      : [];
  } catch (e) {}

  const [selectedChoices, setSelectedChoices] =
    useState<string[]>(initialValue);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const maxChoicesNum = parseInt(maxChoices || '', 10) || 0;
  const maxReached =
    multiple && maxChoicesNum > 0 && selectedChoices.length >= maxChoicesNum;

  const handleChoiceChange = (choiceValue: string) => {
    if (!multiple) {
      setSelectedChoices([choiceValue]);
    } else {
      setSelectedChoices((prev) => {
        if (prev.includes(choiceValue)) {
          return prev.filter((choice) => choice !== choiceValue);
        }
        if (maxChoicesNum > 0 && prev.length >= maxChoicesNum) {
          return prev;
        }
        return [...prev, choiceValue];
      });
    }
  };

  const didInitRef = useRef(false);
  useEffect(() => {
    if (onChange) {
      onChange({
        name: fieldKey,
        value: JSON.stringify(selectedChoices),
        // The first emit is the mount initialisation, not a user interaction.
        isInitial: !didInitRef.current,
      });
    }
    didInitRef.current = true;
  }, [selectedChoices]);

  class HtmlContent extends React.Component<{ html: any }> {
    render() {
      let { html } = this.props;
      return <RteContent content={html} unwrapSingleRootDiv={true} />;
    }
  }

  const ChoiceComponent = multiple ? Checkbox : RadioButton;

  const hasInitialSelection = selectedChoices.length > 0;
  const [checkInvalid, setCheckInvalid] = useState(
    fieldRequired && !hasInitialSelection
  );

  useEffect(() => {
    if (fieldRequired && selectedChoices.length > 0) {
      setCheckInvalid(false);
    }
  }, [fieldRequired, selectedChoices]);

  return (
    <div className={`question`}>
      <Fieldset
        invalid={fieldInvalid}
        aria-describedby={fieldInvalid ? `${randomId}_error` : undefined}>
        {title && (
          <FieldsetLegend>
            <RteContent
              content={title}
              unwrapSingleRootDiv={true}
              forceInline={true}
              inlineComponent={InlineParagraph}
            />
          </FieldsetLegend>
        )}

        {description && (
          <FormFieldDescription>
            <RteContent content={description} unwrapSingleRootDiv={true} />
          </FormFieldDescription>
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
          images: images,
          createImageSlider: createImageSlider,
          addSpacer: !!infoImage,
          imageClickable: imageClickable,
        })}

        <div className={'image-choice-container'}>
          {choices?.map((choice, index) => {
            const isSelected =
              choice && choice.label
                ? selectedChoices.includes(choice.label)
                : false;
            const titleId = `${idKey}_${index}_title`;
            const descriptionId = `${idKey}_${index}_description`;
            const showTitle = !!choice.label && !choice.hideLabel;
            const showDescription = showTitle && !!choice.description;
            const titleClassName = !showTitle
              ? 'sr-only'
              : showDescription
                ? 'utrecht-heading-4'
                : undefined;
            return (
              <FormField type="radio" key={index}>
                <FormFieldLabel className="utrecht-form-field__label--radio osc-clickable-image-anchor">
                  <FormLabel
                    htmlFor={`${idKey}_${index}`}
                    type="radio"
                    className={isSelected ? 'selected' : ''}>
                    <span className="image-choice-figure">
                      <img src={choice.imageSrc} alt={choice.imageAlt} />
                      <span className="image-choice-caption">
                        <ChoiceComponent
                          className="radio-field-input"
                          id={`${idKey}_${index}`}
                          name={fieldKey}
                          required={fieldRequired}
                          onChange={() => {
                            (handleChoiceChange(choice.value),
                              setCheckInvalid(false));
                          }}
                          disabled={
                            disabled ||
                            (maxReached &&
                              !selectedChoices.includes(choice.value))
                          }
                          checked={
                            choice && choice.value
                              ? selectedChoices.includes(choice.value)
                              : false
                          }
                          aria-labelledby={choice.label ? titleId : undefined}
                          aria-describedby={
                            showDescription ? descriptionId : undefined
                          }
                        />
                        {choice.label && (
                          <span id={titleId} className={titleClassName}>
                            {choice.label}
                          </span>
                        )}
                      </span>
                    </span>
                  </FormLabel>
                  <ClickableImage
                    clickable={imageClickable}
                    src={choice.imageSrc}
                    alt={choice.imageAlt}
                    variant="trigger"
                  />
                  {showDescription && (
                    <div
                      id={descriptionId}
                      className="image-choice-description">
                      <RteContent
                        content={choice.description}
                        inlineComponent={Paragraph}
                        unwrapSingleRootDiv={true}
                      />
                    </div>
                  )}
                </FormFieldLabel>
              </FormField>
            );
          })}
        </div>
        {maxReached && maxChoicesMessage && (
          <em aria-live="polite">{maxChoicesMessage}</em>
        )}
      </Fieldset>
      {infoField && (
        <div className="extra-info-container">
          <button
            className="more-info-btn"
            onClick={(e) => {
              setIsInfoVisible(!isInfoVisible);
              e.preventDefault();
            }}>
            Info
          </button>
          <div
            className="info-card"
            aria-hidden={!isInfoVisible ? 'true' : 'false'}
            onClick={() => {
              setIsInfoVisible(false);
            }}>
            <div className="info-card-container">
              <Paragraph>{infoField}</Paragraph>

              <Button
                appearance="primary-action-button"
                tabIndex={!isInfoVisible ? -1 : undefined}
                onClick={() => {
                  setIsInfoVisible(false);
                }}>
                Snap ik
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageChoiceField;
