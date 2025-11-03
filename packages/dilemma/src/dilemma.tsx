import './dilemma.scss';
import React, { useState, useEffect, FC, } from 'react';
import type { BaseProps } from '@openstad-headless/types';
import { Heading, Paragraph, Button } from '@utrecht/component-library-react';


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
};

const DilemmaField: FC<DilemmaFieldProps> = ({
  title,
  infoField,
  infofieldExplanation,
  options = [],
  setCurrentPage,
  currentPage = 0,
  ...props
}) => {

  const [infoDialog, setInfoDialog] = useState<boolean>(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState<boolean>(false);

  console.log(infofieldExplanation)

  return (
    <div className={`dilemma-field ${infofieldExplanation ? '--explanation' : ''}`} {...props}>
      <div className="dilemma-intro">
        <Heading level={2} dangerouslySetInnerHTML={{ __html: title || '' }} />
      </div>

      <div className="dilemma-options">
        <span className="dilemma-label" aria-hidden="true">
          <span>OF</span>
        </span>
        {options.map((option) => (
          <div key={option.id} className="dilemma-option">
            <input type="radio" id={`option-${option.id}`} name="dilemma-option" value={option.id} />
            <label htmlFor={`option-${option.id}`}>
              <figure className="dilemma-option-image">
                <img src={option.image} alt={option.title} />
              </figure>
              <div className="dilemma-option-content">
                <Heading level={3} appearance="utrecht-heading-4" dangerouslySetInnerHTML={{ __html: option.title }} />
                <Paragraph dangerouslySetInnerHTML={{ __html: option.description }} />
              </div>
            </label>
          </div>
        ))}
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
            <textarea autoFocus placeholder='Toelichting...' rows={5} />
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
