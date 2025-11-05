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
  fieldKey?: string;
  type?: string;
  required?: boolean;
  overrideDefaultValue?: FormValue;
  onChange?: (e: { name: string, value: FormValue }, triggerSetLastKey?: boolean) => void;
};

type valueObject = Array< { dilemmaId: string; answer: string; explanation?: string } >;


const DilemmaField: FC<DilemmaFieldProps> = ({
                                               title,
                                               infoField,
                                               infofieldExplanation,
                                               dilemmas = [],
                                               setCurrentPage,
                                               currentPage = 0,
                                               required = false,
                                               onChange,
                                               fieldKey = 'dilemma',
                                               overrideDefaultValue,
                                               ...props
                                             }) => {
  const dilemmaCards = useMemo(() => dilemmas.length > 0 ? dilemmas : [], [dilemmas]);

  let initialAnswers: Record<string, string> = {};
  let initialAnswersExplanation: Record<string, string> = {};

  if (overrideDefaultValue && typeof overrideDefaultValue === 'object') {
    const overrideArray = overrideDefaultValue as valueObject;
    overrideArray.forEach(item => {
      initialAnswers[item.dilemmaId as string] = item.answer;
      if (item.explanation) {
        initialAnswersExplanation[item.dilemmaId as string] = item.explanation;
      }
    });
  }

  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [dilemmaAnswers, setDilemmaAnswers] = useState<Record<string, string>>(initialAnswers);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | null>(null);

  const [infoDialog, setInfoDialog] = useState<boolean>(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState<boolean>(false);
  const [explanations, setExplanations] = useState<Record<string, string>>(initialAnswersExplanation);

  const getUnansweredDilemmas = useCallback(() => {
    return dilemmaCards.filter(dilemma => !dilemmaAnswers[dilemma.id]);
  }, [dilemmaCards, dilemmaAnswers]);

  const unansweredDilemmas = getUnansweredDilemmas();
  const currentDilemma = unansweredDilemmas?.find((card) => card.id === String(currentDilemmaIndex)) || null;

  const handleOptionSelect = useCallback((option: 'a' | 'b') => {
    if (!currentDilemma) return;
    setSelectedOption(option);
  }, [currentDilemma]);

  const moveToNext = useCallback(() => {
    if (selectedOption && currentDilemma) {
      const newAnswers = {
        ...dilemmaAnswers,
        [currentDilemma.id]: selectedOption
      };
      setDilemmaAnswers(newAnswers);
    }

    setSelectedOption(null);

    const updatedUnanswered = getUnansweredDilemmas();
    if (currentDilemmaIndex + 1 < updatedUnanswered.length) {
      setCurrentDilemmaIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentDilemmaIndex, getUnansweredDilemmas, selectedOption, currentDilemma, dilemmaAnswers, fieldKey]);

  const moveToPrevious = useCallback(() => {
    const answeredDilemmas = dilemmaCards.filter(dilemma => dilemmaAnswers[dilemma.id]);

    if (answeredDilemmas.length === 0) {
      return;
    }

    const lastAnsweredDilemma = answeredDilemmas[answeredDilemmas.length - 1];
    const newDilemmaAnswers = { ...dilemmaAnswers };
    delete newDilemmaAnswers[lastAnsweredDilemma.id];

    setDilemmaAnswers(newDilemmaAnswers);

    setSelectedOption(null);

    const futureUnanswered = dilemmaCards.filter(dilemma => !newDilemmaAnswers[dilemma.id]);
    const targetIndex = futureUnanswered.findIndex(d => d.id === lastAnsweredDilemma.id);

    if (targetIndex !== -1) {
      setCurrentDilemmaIndex(targetIndex);
    }
  }, [currentDilemmaIndex, unansweredDilemmas, currentDilemma, dilemmaCards, dilemmaAnswers, fieldKey]);

  const canGoBack = useCallback(() => {
    if (currentDilemmaIndex > 0) return true;

    const answeredDilemmaIds = Object.keys(dilemmaAnswers);
    return answeredDilemmaIds.length > 0;
  }, [currentDilemmaIndex, dilemmaAnswers]);

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
      ...dilemmaAnswers,
      [dilemmaId]: newAnswer
    };
    setDilemmaAnswers(newAnswers);
  };

  const handleExplanationChange = (dilemmaId: string, explanation: string) => {
    setExplanations(prev => ({
      ...prev,
      [dilemmaId]: explanation
    }));
  };

  const goBackToDilemmas = useCallback(() => {
    const answeredDilemmas = dilemmaCards.filter(dilemma => dilemmaAnswers[dilemma.id]);

    if (answeredDilemmas.length > 0) {
      // Ga terug naar het laatste beantwoorde dilemma en maak het onbeantwoord
      const lastAnsweredDilemma = answeredDilemmas[answeredDilemmas.length - 1];
      const newDilemmaAnswers = { ...dilemmaAnswers };
      delete newDilemmaAnswers[lastAnsweredDilemma.id];

      setDilemmaAnswers(newDilemmaAnswers);

      // Bereken welke dilemma's nog niet beantwoord zijn na deze wijziging
      const futureUnanswered = dilemmaCards.filter(dilemma => !newDilemmaAnswers[dilemma.id]);
      const targetIndex = futureUnanswered.findIndex(d => d.id === lastAnsweredDilemma.id);

      setCurrentDilemmaIndex(targetIndex !== -1 ? targetIndex : 0);
    } else {
      setCurrentDilemmaIndex(0);
    }

    setIsFinished(false);
    setSelectedOption(null);
  }, [dilemmaCards, dilemmaAnswers, fieldKey]);

  useEffect(() => {
    if (onChange) {
      const combinedAnswers: valueObject = dilemmaCards.map((card) => {
        const answer = dilemmaAnswers[card.id] || '';
        const title = card[answer as 'a' | 'b']?.title || '';

        return {
          dilemmaId: card.id,
          answer: answer,
          title: title,
          explanation: explanations[card.id] || '',
        }
      }).filter(item => item.answer !== undefined);

      onChange({ name: fieldKey, value: combinedAnswers });
    }
  }, [dilemmaAnswers, explanations]);

  useEffect(() => {
    // setCurrentDilemmaIndex(0);
    // setSelectedOption(null);

    const unanswered = getUnansweredDilemmas();
    setIsFinished(unanswered.length === 0);
  }, [dilemmas, dilemmaCards, getUnansweredDilemmas]);

  if (isFinished || unansweredDilemmas.length === 0) {
    return (
      <div className="dilemma-field dilemma-finished" role="region" aria-live="polite" tabIndex={0}>
        <div className="dilemma-finished-content">
          <div className="dilemma-intro">
            <Heading level={2}>Jouw keuzes</Heading>
            <Paragraph>Bekijk en wijzig eventueel je antwoorden op de dilemma's:</Paragraph>
          </div>

          <div className="dilemma-actions">
            <button
              className="dilemma-back-button"
              onClick={(e) => (e.preventDefault(), goBackToDilemmas())}
              type="button"
              aria-label="Ga terug naar dilemma's"
            >
              Terug
            </button>
          </div>

          <div className="dilemma-summary">
            {dilemmaCards.map((dilemma) => {
              const answer = dilemmaAnswers[dilemma.id] || '';

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
            <textarea
              autoFocus
              placeholder='Toelichting...'
              rows={5}
              value={explanations[currentDilemma.id] || ''}
              onChange={(e) => handleExplanationChange(currentDilemma.id, e.target.value)}
            />
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