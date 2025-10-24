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
  options = [],
  ...props
}) => {

  const [infoDialog, setInfoDialog] = useState<boolean>(false);

  console.log(options)

  return (
    <div className="dilemma-field">
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
