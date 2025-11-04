import './dilemma.scss';
import React, { useState, useEffect, FC, useCallback, useMemo } from 'react';
import type { BaseProps } from '@openstad-headless/types';
import { Heading, Paragraph, Button } from '@utrecht/component-library-react';
import { FormValue } from '@openstad-headless/form/src/form';

export type DilemmaOption = {
  title: string;
  description: string;
  image: string;
};

export type DilemmaCard = {
  id: string;
  infoField?: string;
  infofieldExplanation?: boolean;
  a: DilemmaOption;
  b: DilemmaOption;
};

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
  dilemmas?: DilemmaCard[];
  fieldKey: string;
  type?: string;
  required?: boolean;
  overrideDefaultValue?: FormValue;
  onChange?: (e: { name: string, value: FormValue }, triggerSetLastKey?: boolean) => void;
};


const DilemmaField: FC<DilemmaFieldProps> = ({
  title,
  infoField,
  infofieldExplanation,
  dilemmas = [],
  setCurrentPage,
  currentPage = 0,
  required = false,
  onChange,
  fieldKey,
  overrideDefaultValue,
  ...props
}) => {
  // Initialize data
  const dilemmaCards = dilemmas.length > 0 ? dilemmas : [];
  const initialAnswers = useMemo(() =>
    overrideDefaultValue ? (overrideDefaultValue as Record<string, 'a' | 'b'>) : {},
    [overrideDefaultValue]
  );

  // Core navigation state
  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [dilemmaAnswers, setDilemmaAnswers] = useState<Record<string, 'a' | 'b'>>(initialAnswers);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | null>(null);

  // UI state
  const [infoDialog, setInfoDialog] = useState<boolean>(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState<boolean>(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  // Helper function to get unanswered dilemmas (only based on initial answers)
  const getUnansweredDilemmas = useCallback(() =>
    dilemmaCards.filter(dilemma => !initialAnswers[dilemma.id]),
    [dilemmaCards, initialAnswers]
  );

  // Get unanswered dilemmas (static list based on initial state)
  const unansweredDilemmas = getUnansweredDilemmas();

  // Get current dilemma - this should stay stable even when answers change
  const currentDilemma = unansweredDilemmas[currentDilemmaIndex];

  // Handle option selection (NO automatic navigation - user must click "Volgende")
  const handleOptionSelect = useCallback((option: 'a' | 'b') => {
    if (!currentDilemma) return;

    // ONLY update the selected option - NO onChange call here to prevent parent navigation
    setSelectedOption(option);

    // EXPLICITLY NO NAVIGATION HERE - user must click "Volgende" button
    // NO onChange CALL HERE - will be called in moveToNext()
  }, [currentDilemma]);

  const moveToNext = useCallback(() => {
    // Now commit the selected option to the dilemmaAnswers state AND call onChange
    if (selectedOption && currentDilemma) {
      const newAnswers = {
        ...initialAnswers,
        ...dilemmaAnswers,
        [currentDilemma.id]: selectedOption
      };
      setDilemmaAnswers(newAnswers);

      // Call onChange here when navigation actually happens
      if (onChange) {
        onChange({ name: fieldKey, value: newAnswers }, false);
      }
    }

    setSelectedOption(null);

    // Check if there are more unanswered dilemmas after the current one
    const remainingUnanswered = unansweredDilemmas.slice(currentDilemmaIndex + 1);
    if (remainingUnanswered.length > 0) {
      setCurrentDilemmaIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentDilemmaIndex, unansweredDilemmas, selectedOption, currentDilemma, initialAnswers, dilemmaAnswers, onChange, fieldKey]);

  // Handle "Volgende" button click
  const handleNextClick = useCallback(() => {
    if (!selectedOption || !currentDilemma) return;

    // Show explanation dialog if required for this specific dilemma
    if (currentDilemma.infofieldExplanation) {
      setShowExplanationDialog(true);
    } else {
      moveToNext();
    }
  }, [selectedOption, currentDilemma, moveToNext]);

  const handleExplanationComplete = useCallback(() => {
    setShowExplanationDialog(false);
    moveToNext();
  }, [moveToNext]);

  const handleAnswerChange = (dilemmaId: string, newAnswer: 'a' | 'b') => {
    const newAnswers = {
      ...initialAnswers,
      ...dilemmaAnswers,
      [dilemmaId]: newAnswer
    };
    setDilemmaAnswers(newAnswers);

    if (onChange) {
      onChange({ name: fieldKey, value: newAnswers });
    }
  };

  const handleExplanationChange = (dilemmaId: string, explanation: string) => {
    setExplanations(prev => ({
      ...prev,
      [dilemmaId]: explanation
    }));
  };

  // Initialize when dilemmas change
  useEffect(() => {
    setCurrentDilemmaIndex(0);
    setSelectedOption(null);

    // Check if all dilemmas are already answered
    const unanswered = dilemmaCards.filter(dilemma => !initialAnswers[dilemma.id]);
    setIsFinished(unanswered.length === 0);
  }, [dilemmas, initialAnswers, dilemmaCards]);

  // If finished or no unanswered dilemmas remain, show overview
  if (isFinished || unansweredDilemmas.length === 0) {
    return (
      <div className="dilemma-field dilemma-finished" role="region" aria-live="polite" tabIndex={0}>
        <div className="dilemma-finished-content">
          <div className="dilemma-intro">
            <Heading level={2}>Jouw keuzes</Heading>
            <Paragraph>Bekijk en wijzig eventueel je antwoorden op de dilemma's:</Paragraph>
          </div>

          <div className="dilemma-summary">
            {dilemmaCards.map((dilemma) => {
              // Get answer from either initial answers or current answers
              const answer = dilemmaAnswers[dilemma.id] || initialAnswers[dilemma.id];
              const selectedOptionData = answer ? dilemma[answer] : null;

              return (
                <div key={dilemma.id} className="dilemma-summary-item">
                  <div className="dilemma-summary-content">
                    <div className="dilemma-summary-option">
                      <button
                        className={`dilemma-summary-btn ${answer === 'a' ? 'active' : ''}`}
                        onClick={(e) => (e.preventDefault(), handleAnswerChange(dilemma.id, 'a'))}
                        aria-label={`Kies optie A: ${dilemma.a.title}`}
                      >
                        <figure className="dilemma-option-image">
                          <img src={dilemma.a.image} alt={dilemma.a.title} />
                        </figure>
                        <div className="dilemma-option-content">
                          <Heading level={3} appearance="utrecht-heading-4">{dilemma.a.title}</Heading>
                          <Paragraph>{dilemma.a.description}</Paragraph>
                        </div>
                      </button>
                    </div>

                    <div className="dilemma-summary-option">
                      <button
                        className={`dilemma-summary-btn ${answer === 'b' ? 'active' : ''}`}
                        onClick={(e) => (e.preventDefault(), handleAnswerChange(dilemma.id, 'b'))}
                        aria-label={`Kies optie B: ${dilemma.b.title}`}
                      >
                        <figure className="dilemma-option-image">
                          <img src={dilemma.b.image} alt={dilemma.b.title} />
                        </figure>
                        <div className="dilemma-option-content">
                          <Heading level={3} appearance="utrecht-heading-4">{dilemma.b.title}</Heading>
                          <Paragraph>{dilemma.b.description}</Paragraph>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="dilemma-summary-explanation">
                    <textarea
                      id={`explanation-${dilemma.id}`}
                      placeholder="Voeg hier een toelichting (optioneel) toe..."
                      value={explanations[dilemma.id] || ''}
                      onChange={(e) => handleExplanationChange(dilemma.id, e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Show current dilemma
  if (!currentDilemma) return null;

  return (
    <div className={`dilemma-field ${infofieldExplanation ? '--explanation' : ''}`}
      role="region"
      aria-label="Dilemma keuze"
      tabIndex={0}
      aria-invalid={required && !dilemmaAnswers[currentDilemma.id] ? 'true' : 'false'}
      data-required={required}>

      <div className="dilemma-intro">
        <Heading level={2} dangerouslySetInnerHTML={{ __html: title || '' }} />
        <div className="dilemma-progress">
          <span>{currentDilemmaIndex + 1} van {unansweredDilemmas.length}</span>
        </div>
      </div>

      <div className="dilemma-options">
        <span className="dilemma-label" aria-hidden="true">
          <span>OF</span>
        </span>

        <div className="dilemma-option">
          <input
            type="radio"
            id={`option-${currentDilemma.id}-a`}
            name={`dilemma-option-${currentDilemma.id}`}
            value="a"
            checked={selectedOption === 'a'}
            onChange={() => handleOptionSelect('a')}
          />
          <label htmlFor={`option-${currentDilemma.id}-a`}>
            <figure className="dilemma-option-image">
              <img src={currentDilemma.a.image} alt={currentDilemma.a.title} />
            </figure>
            <div className="dilemma-option-content">
              <Heading level={3} appearance="utrecht-heading-4" dangerouslySetInnerHTML={{ __html: currentDilemma.a.title }} />
              <Paragraph dangerouslySetInnerHTML={{ __html: currentDilemma.a.description }} />
            </div>
          </label>
        </div>

        <div className="dilemma-option">
          <input
            type="radio"
            id={`option-${currentDilemma.id}-b`}
            name={`dilemma-option-${currentDilemma.id}`}
            value="b"
            checked={selectedOption === 'b'}
            onChange={() => handleOptionSelect('b')}
          />
          <label htmlFor={`option-${currentDilemma.id}-b`}>
            <figure className="dilemma-option-image">
              <img src={currentDilemma.b.image} alt={currentDilemma.b.title} />
            </figure>
            <div className="dilemma-option-content">
              <Heading level={3} appearance="utrecht-heading-4" dangerouslySetInnerHTML={{ __html: currentDilemma.b.title }} />
              <Paragraph dangerouslySetInnerHTML={{ __html: currentDilemma.b.description }} />
            </div>
          </label>
        </div>
      </div>

      <div className="dilemma-actions">
        <button
          className="more-info-btn dilemma-info-button"
          onClick={(e) => (e.preventDefault(), setInfoDialog(true))}
          type="button"
          disabled={!currentDilemma?.infoField}
          aria-expanded={infoDialog}
        >
          <span>Info</span>
        </button>

        <Button
          appearance="primary-action-button"
          className="dilemma-next-button"
          onClick={(e) => (e.preventDefault(), handleNextClick())}
          disabled={!selectedOption}
          type="button"
        >
          Volgende
        </Button>
      </div>

      {showExplanationDialog && (
        <div className="explanation-dialog" role="dialog" aria-modal="true" aria-labelledby="explanation-dialog-title">
          <div className="explanation-dialog-content">
            <Heading level={3} id="explanation-dialog-title">Kun je kort uitleggen waarom dit belangrijk is voor jou?</Heading>
            <Paragraph>Zo begrijpen we beter wat jongeren écht nodig hebben in de wijk.</Paragraph>
            <textarea autoFocus placeholder='Toelichting...' rows={5} />
            <Button appearance="primary-action-button" onClick={handleExplanationComplete}>
              Antwoord verzenden
            </Button>
            <Button appearance="secondary-action-button" onClick={handleExplanationComplete}>
              Sluiten zonder toelichting
            </Button>
          </div>
        </div>
      )}

      <div className="info-card dilemma-info-field" aria-hidden={!infoDialog}>
        <div className="info-card-container">
          <Paragraph dangerouslySetInnerHTML={{ __html: currentDilemma?.infoField || '' }} />
          <button
            className="utrecht-button utrecht-button--primary-action"
            type="button"
            onClick={(e) => (e.preventDefault(), setInfoDialog(false))}
          >
            Snap ik
          </button>
        </div>
      </div>
    </div>
  );
}
export { DilemmaField };
export default DilemmaField;
