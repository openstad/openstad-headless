import './dilemma.scss';
import React, { useState, useEffect, FC, } from 'react';
import type { BaseProps } from '@openstad-headless/types';
import {Heading, Paragraph, Button, Textarea, RadioButton, FormLabel} from '@utrecht/component-library-react';
import { FormValue } from "@openstad-headless/form/src/form";


export type DilemmaFieldProps = BaseProps &
  DilemmaProps & {
    resourceId?: string;
    resourceIdRelativePath?: string;
  };

export type DilemmaProps = {
  title?: string;
  infoField?: string;
  infofieldExplanation?: boolean;
  setCurrentPage?: any;
  currentPage?: number;
  options?: Array<{
    id: number;
    title: string;
    description: string;
    image: string;
  }>;
  overrideDefaultValue?: FormValue;
  fieldKey?: string;
  onChange?: (e: { name: string, value: FormValue }, triggerSetLastKey?: boolean) => void;
};

type valueObject = {selectedOption: string, optionExplanation: string};

const DilemmaField: FC<DilemmaFieldProps> = ({
  title,
  infoField,
  infofieldExplanation,
  options = [],
  setCurrentPage,
  currentPage = 0,
  overrideDefaultValue,
  onChange,
  fieldKey = 'dilemma',
  ...props
}) => {
  const initialValue =
    overrideDefaultValue &&
    typeof overrideDefaultValue === 'object' &&
    'selectedOption' in overrideDefaultValue &&
    'optionExplanation' in overrideDefaultValue
      ? overrideDefaultValue as valueObject
      : { selectedOption: '', optionExplanation: '' };

  const [infoDialog, setInfoDialog] = useState<boolean>(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState<boolean>(false);

  const [value, setValue] = useState<valueObject>(initialValue);

  const changeValue = (key: 'selectedOption' | 'optionExplanation', newValue: any) => {
    const currValue: valueObject = {...value};

    if (key === 'selectedOption') {
      currValue.selectedOption = newValue as string;
    } else if (key === 'optionExplanation') {
      currValue.optionExplanation = newValue as string;
    }

    if ( onChange ) {
      onChange({
        name: fieldKey,
        value: currValue,
      });
    }

    setValue(currValue);
  }

  return (
    <div className={`dilemma-field ${infofieldExplanation ? '--explanation' : ''}`} {...props}>
      <div className="dilemma-intro">
        <Heading level={2} dangerouslySetInnerHTML={{ __html: title || '' }} />
      </div>

      <div className="dilemma-options">
        <span className="dilemma-label" aria-hidden="true">
          <span>OF</span>
        </span>
        {options.map((option) => {
          const optionKey = option?.title || option.id

          return (
            <div key={option.id} className="dilemma-option">
              <FormLabel
                htmlFor={`option-${option.id}`}
                type="radio"
                className="--label-grid"
              >
                <RadioButton
                  id={`option-${option.id}`}
                  name={fieldKey}
                  onChange={() => {
                    changeValue("selectedOption", String(optionKey))
                  }}
                  value={optionKey}
                  checked={value?.selectedOption === String(optionKey)}
                />
                <figure className="dilemma-option-image">
                  <img src={option.image} alt={option.title}/>
                </figure>
                <div className="dilemma-option-content">
                  <Heading level={3} appearance="utrecht-heading-4" dangerouslySetInnerHTML={{__html: option.title}}/>
                  <Paragraph dangerouslySetInnerHTML={{__html: option.description}}/>
                </div>
              </FormLabel>

            </div>
          )
        })}
      </div>


      <button className="more-info-btn dilemma-info-button" onClick={(e) => (e.preventDefault(), setInfoDialog(true))} type="button" aria-expanded={infoDialog}>
        <span>Info</span>
      </button>

      {infofieldExplanation && (
        <button className="utrecht-button utrecht-button--submit utrecht-button--primary-action dilemma-explanation-button" onClick={(e) => (e.preventDefault(), setShowExplanationDialog(true))} type="button">
          <span>Volgende</span>
        </button>
      )}

      {showExplanationDialog && (
        <div className={`explanation-dialog`} role="dialog" aria-modal="true" aria-labelledby="explanation-dialog-title">
          <div className="explanation-dialog-content">
            <Heading level={3} id="explanation-dialog-title">Kun je kort uitleggen waarom dit belangrijk is voor jou?</Heading>
            <Paragraph> Zo begrijpen we beter wat jongeren écht nodig hebben in de wijk.</Paragraph>

            <Textarea
              autoFocus
              placeholder='Toelichting...'
              rows={5}
              name={ 'dilemma-explanation' }
              value={ value.optionExplanation || '' }
              onChange={(e) => { changeValue("optionExplanation", e.target.value); }}
            />

            <Button appearance="primary-action-button" onClick={() => {
              setShowExplanationDialog(false);
              setCurrentPage(currentPage + 1)
            }}>Antwoord verzenden</Button>
            <Button appearance="secondary-action-button" onClick={() => {
              setShowExplanationDialog(false);
              setCurrentPage(currentPage + 1)
            }}>Sluiten zonder toelichting</Button>
          </div>
        </div>
      )}


      <div className="info-card dilemma-info-field" aria-hidden={!infoDialog}>
        <div className="info-card-container">
          <Paragraph dangerouslySetInnerHTML={{ __html: infoField || '' }} />

          <button className="utrecht-button utrecht-button--primary-action" type="button" onClick={(e) => (e.preventDefault(), setInfoDialog(false))}>Snap ik</button>
        </div>
      </div>
    </div>
  );
}
export { DilemmaField };
export default DilemmaField;
