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
  const dilemmaCards = dilemmas.length > 0 ? dilemmas : [];
  const initialAnswers = useMemo(() =>
    overrideDefaultValue ? (overrideDefaultValue as Record<string, 'a' | 'b'>) : {},
    [overrideDefaultValue]
  );

  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [dilemmaAnswers, setDilemmaAnswers] = useState<Record<string, 'a' | 'b'>>(initialAnswers);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | null>(null);

  const [infoDialog, setInfoDialog] = useState<boolean>(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState<boolean>(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  const getUnansweredDilemmas = useCallback(() => {
    const combinedAnswers = { ...initialAnswers, ...dilemmaAnswers };
    return dilemmaCards.filter(dilemma => !combinedAnswers[dilemma.id]);
  }, [dilemmaCards, initialAnswers, dilemmaAnswers]);

  const unansweredDilemmas = getUnansweredDilemmas();
  const currentDilemma = unansweredDilemmas[currentDilemmaIndex];

  const handleOptionSelect = useCallback((option: 'a' | 'b') => {
    if (!currentDilemma) return;
    setSelectedOption(option);
  }, [currentDilemma]);

  const moveToNext = useCallback(() => {
    if (selectedOption && currentDilemma) {
      const newAnswers = {
        ...initialAnswers,
        ...dilemmaAnswers,
        [currentDilemma.id]: selectedOption
      };
      setDilemmaAnswers(newAnswers);

      if (onChange) {
        onChange({ name: fieldKey, value: newAnswers }, false);
      }
    }

    setSelectedOption(null);

    const updatedUnanswered = getUnansweredDilemmas();
    if (currentDilemmaIndex + 1 < updatedUnanswered.length) {
      setCurrentDilemmaIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentDilemmaIndex, getUnansweredDilemmas, selectedOption, currentDilemma, initialAnswers, dilemmaAnswers, onChange, fieldKey]);

  const moveToPrevious = useCallback(() => {
    const combinedAnswers = { ...initialAnswers, ...dilemmaAnswers };
    const answeredDilemmas = dilemmaCards.filter(dilemma => combinedAnswers[dilemma.id]);

    if (answeredDilemmas.length === 0) {
      return;
    }

    const lastAnsweredDilemma = answeredDilemmas[answeredDilemmas.length - 1];
    const newDilemmaAnswers = { ...dilemmaAnswers };
    delete newDilemmaAnswers[lastAnsweredDilemma.id];

    const newCombinedAnswers = { ...initialAnswers, ...newDilemmaAnswers };
    delete newCombinedAnswers[lastAnsweredDilemma.id];

    setDilemmaAnswers(newDilemmaAnswers);

    if (onChange) {
      onChange({ name: fieldKey, value: newCombinedAnswers }, false);
    }

    setSelectedOption(null);

    const futureUnanswered = dilemmaCards.filter(dilemma => !newCombinedAnswers[dilemma.id]);
    const targetIndex = futureUnanswered.findIndex(d => d.id === lastAnsweredDilemma.id);

    if (targetIndex !== -1) {
      setCurrentDilemmaIndex(targetIndex);
    }
  }, [currentDilemmaIndex, unansweredDilemmas, currentDilemma, dilemmaCards, initialAnswers, dilemmaAnswers, onChange, fieldKey]);

  const canGoBack = useCallback(() => {
    if (currentDilemmaIndex > 0) return true;

    const combinedAnswers = { ...initialAnswers, ...dilemmaAnswers };
    const answeredDilemmaIds = Object.keys(combinedAnswers);
    return answeredDilemmaIds.length > 0;
  }, [currentDilemmaIndex, initialAnswers, dilemmaAnswers]);

  const handleNextClick = useCallback(() => {
    if (!selectedOption || !currentDilemma) return;

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

  useEffect(() => {
    setCurrentDilemmaIndex(0);
    setSelectedOption(null);

    const unanswered = getUnansweredDilemmas();
    setIsFinished(unanswered.length === 0);
  }, [dilemmas, initialAnswers, dilemmaCards, getUnansweredDilemmas]);

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
              const answer = dilemmaAnswers[dilemma.id] || initialAnswers[dilemma.id];

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

  const currentIndex = dilemmaCards.length - unansweredDilemmas.length;
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
          <span>{currentIndex + 1} van {dilemmas.length}</span>
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

        <div className="dilemma-navigation-buttons">
          <button
            className="dilemma-back-button"
            onClick={(e) => (e.preventDefault(), moveToPrevious())}
            disabled={!canGoBack()}
            type="button"
            aria-label="Ga terug naar vorige vraag"
          >
            Terug
          </button>

          <button
            className="dilemma-next-button"
            onClick={(e) => (e.preventDefault(), handleNextClick())}
            disabled={!selectedOption}
            type="button"
          >
            <span className="sr-only">Volgende</span>
          </button>
        </div>
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
