import { FormValue } from '@openstad-headless/form/src/form';
import { MultiSelect, Spacer } from '@openstad-headless/ui/src';
import {
  AccordionProvider,
  FormField,
  FormFieldDescription,
  FormLabel,
  Paragraph,
  Select,
  SelectOption,
} from '@utrecht/component-library-react';
import React, { useState } from 'react';
import { FC } from 'react';
import { useEffect, useMemo } from 'react';

import { InfoImage } from '../../infoImage';
import RteContent from '../../rte-formatting/rte-content';
import TextInput from '../text';

export type SelectFieldProps = {
  overrideDefaultValue?: FormValue;
  title?: string;
  description?: string;
  choices?:
    | string[]
    | [
        {
          value: string;
          label: string;
          isOtherOption?: boolean;
          defaultValue?: boolean;
          trigger?: string;
        },
      ];
  fieldRequired?: boolean;
  requiredWarning?: string;
  fieldKey: string;
  defaultOption?: string;
  disabled?: boolean;
  onChange?: (
    e: { name: string; value: FormValue },
    triggerSetLastKey?: boolean
  ) => void;
  type?: string;
  showMoreInfo?: boolean;
  moreInfoButton?: string;
  moreInfoContent?: string;
  infoImage?: string;
  randomId?: string;
  fieldInvalid?: boolean;
  multiple?: boolean;
  defaultValue?: string | string[];
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
};

const SelectField: FC<SelectFieldProps> = ({
  title,
  description,
  choices = [],
  fieldKey,
  defaultOption = 'Selecteer een optie',
  fieldRequired = false,
  onChange,
  disabled = false,
  showMoreInfo = false,
  moreInfoButton = 'Meer informatie',
  moreInfoContent = '',
  infoImage = '',
  randomId = '',
  fieldInvalid = false,
  multiple = false,
  defaultValue = [],
  overrideDefaultValue,
  images = [],
  createImageSlider = false,
  imageClickable = false,
}) => {
  type NormalizedChoice = {
    value: string;
    label: string;
    isOtherOption?: boolean;
    trigger?: string;
  };

  const normalizedChoices: NormalizedChoice[] = useMemo(
    () =>
      choices.map((choice) => {
        if (typeof choice === 'string') {
          return { value: choice, label: choice };
        } else {
          return choice;
        }
      }),
    [choices]
  );

  const [otherOptionValues, setOtherOptionValues] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const initialOtherOptionValues: { [key: string]: string } = {};
    normalizedChoices?.forEach((choice, index) => {
      if (choice?.isOtherOption) {
        const id = choice.trigger || `${index}`;
        initialOtherOptionValues[`${fieldKey}_${id}_other`] = '';
      }
    });
    setOtherOptionValues(initialOtherOptionValues);
  }, [normalizedChoices, fieldKey]);

  class HtmlContent extends React.Component<{ html: any }> {
    render() {
      let { html } = this.props;
      return <RteContent content={html} unwrapSingleRootDiv={true} />;
    }
  }

  let initialValue = multiple
    ? defaultValue
    : Array.isArray(defaultValue) && defaultValue.length > 0
      ? defaultValue[0]
      : '';

  initialValue = overrideDefaultValue
    ? (overrideDefaultValue as string | string[])
    : initialValue;

  const [selected, setSelected] = useState<string | string[]>(initialValue);

  const selectedChoiceIndex = normalizedChoices.findIndex(
    (choice) => choice.value === selected
  );
  const selectedChoice =
    selectedChoiceIndex > -1
      ? normalizedChoices[selectedChoiceIndex]
      : undefined;

  const handleOtherOptionChange = (e: { name: string; value: string }) => {
    setOtherOptionValues({
      ...otherOptionValues,
      [e.name]: e.value,
    });
    if (onChange) {
      onChange(
        {
          name: e.name,
          value: e.value,
        },
        false
      );
    }
  };

  return (
    <FormField type="select">
      {title && (
        <FormLabel htmlFor={fieldKey}>
          <RteContent
            content={title}
            unwrapSingleRootDiv={true}
            forceInline={true}
          />
        </FormLabel>
      )}
      {description && (
        <>
          <FormFieldDescription>
            <RteContent content={description} unwrapSingleRootDiv={true} />
          </FormFieldDescription>
          <Spacer size={0.5} />
        </>
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

      <Paragraph className="utrecht-form-field__input">
        {multiple ? (
          <MultiSelect
            label={defaultOption}
            id={fieldKey}
            options={normalizedChoices.map((choice) => ({
              value: choice.value,
              label: choice.label,
              checked: Array.isArray(selected)
                ? selected.includes(choice.value)
                : false,
            }))}
            onItemSelected={(optionValue: string) => {
              let newSelected = Array.isArray(selected) ? [...selected] : [];
              if (newSelected.includes(optionValue)) {
                newSelected = newSelected.filter((v) => v !== optionValue);
              } else {
                newSelected.push(optionValue);
              }
              setSelected(newSelected);
              if (onChange) {
                onChange({
                  name: fieldKey,
                  value: newSelected?.join(','),
                });
              }
            }}
          />
        ) : (
          <Select
            className="form-item"
            name={fieldKey}
            id={fieldKey}
            required={fieldRequired}
            onChange={(e) => {
              setSelected(e.target.value);
              if (onChange) {
                onChange({
                  name: fieldKey,
                  value: e.target.value,
                });
              }

              const newChoiceIndex = normalizedChoices.findIndex(
                (choice) => choice.value === e.target.value
              );
              const newChoice =
                newChoiceIndex > -1
                  ? normalizedChoices[newChoiceIndex]
                  : undefined;
              const newTrigger = newChoice?.trigger || `${newChoiceIndex}`;

              const updatedOtherOptionValues = { ...otherOptionValues };
              Object.keys(updatedOtherOptionValues).forEach((key) => {
                if (key !== `${fieldKey}_${newTrigger}_other`) {
                  updatedOtherOptionValues[key] = '';
                  if (onChange) {
                    onChange(
                      {
                        name: key,
                        value: '',
                      },
                      false
                    );
                  }
                }
              });
              setOtherOptionValues(updatedOtherOptionValues);
            }}
            disabled={disabled}
            aria-invalid={fieldInvalid}
            aria-describedby={fieldInvalid ? `${randomId}_error` : undefined}
            value={selected}>
            <SelectOption value="">{defaultOption}</SelectOption>
            {normalizedChoices?.map((value, index) => (
              <SelectOption key={index} value={value && value.value}>
                {value && value.label}
              </SelectOption>
            ))}
          </Select>
        )}
        {!multiple && selectedChoice?.isOtherOption && (
          <div className="select-other-option">
            <TextInput
              type="text"
              // @ts-ignore
              onChange={(e: { name: string; value: string }) =>
                handleOtherOptionChange(e)
              }
              fieldKey={`${fieldKey}_${
                selectedChoice.trigger || selectedChoiceIndex
              }_other`}
              title={selectedChoice.label || 'Anders, namelijk'}
              placeholder="Vul hier uw antwoord in"
              fieldInvalid={false}
              randomId={`${fieldKey}_${
                selectedChoice.trigger || selectedChoiceIndex
              }`}
            />
          </div>
        )}
      </Paragraph>
    </FormField>
  );
};

export default SelectField;
