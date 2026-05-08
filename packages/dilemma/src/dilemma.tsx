import type { FormValue } from '@openstad-headless/form/src/form';
import type { BaseProps } from '@openstad-headless/types';
import { Button, Heading, Paragraph } from '@utrecht/component-library-react';
import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import './dilemma.scss';

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
  dilemmas?: Array<DilemmaCard>;
  fieldKey?: string;
  type?: string;
  required?: boolean;
  overrideDefaultValue?: FormValue;
  onChange?: (
    e: { name: string; value: FormValue },
    triggerSetLastKey?: boolean
  ) => void;
};

type valueObject = Array<{
  dilemmaId: string;
  answer: string;
  explanation?: string;
}>;

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
  const dilemmaCards = useMemo(
    () => (dilemmas.length > 0 ? dilemmas : []),
    [dilemmas]
  );

  const initialAnswers: Record<string, string> = {};
  const initialAnswersExplanation: Record<string, string> = {};

  if (overrideDefaultValue && typeof overrideDefaultValue === 'object') {
    const overrideArray = overrideDefaultValue as valueObject;
    overrideArray.forEach((item) => {
      initialAnswers[item.dilemmaId] = item.answer;
      if (item.explanation) {
        initialAnswersExplanation[item.dilemmaId] = item.explanation;
      }
    });
  }

  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [dilemmaAnswers, setDilemmaAnswers] =
    useState<Record<string, string>>(initialAnswers);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | null>(null);

  const [previousAnswers, setPreviousAnswers] = useState<
    Record<string, string>
  >({});

  const [infoDialog, setInfoDialog] = useState<boolean>(false);
  const [showExplanationDialog, setShowExplanationDialog] =
    useState<boolean>(false);
  const [explanations, setExplanations] = useState<Record<string, string>>(
    initialAnswersExplanation
  );

  const getUnansweredDilemmas = useCallback(() => {
    return dilemmaCards.filter((dilemma) => !dilemmaAnswers[dilemma.id]);
  }, [dilemmaCards, dilemmaAnswers]);

  const unansweredDilemmas = getUnansweredDilemmas();
  const currentDilemma = unansweredDilemmas[currentDilemmaIndex] || null;

  const handleOptionSelect = useCallback(
    (option: 'a' | 'b') => {
      if (!currentDilemma) return;

      const optionToSet = option === selectedOption ? null : option;
      setSelectedOption(optionToSet);
    },
    [currentDilemma, selectedOption]
  );

  const moveToNext = useCallback(() => {
    let newAnswers = dilemmaAnswers;
    let answerToUse = selectedOption;
    if (!answerToUse && previousAnswers[currentDilemma?.id]) {
      answerToUse = previousAnswers[currentDilemma.id] as 'a' | 'b';
    }
    if (answerToUse && currentDilemma) {
      newAnswers = {
        ...dilemmaAnswers,
        [currentDilemma.id]: answerToUse,
      };
      setDilemmaAnswers(newAnswers);
      // Na opslaan van antwoord, verwijder uit previousAnswers
      setPreviousAnswers((prev) => {
        const updated = { ...prev };
        delete updated[currentDilemma.id];
        return updated;
      });
    }

    setSelectedOption(null);

    // Find next unanswered dilemma index
    const unanswered = dilemmaCards.filter((d) => !newAnswers[d.id]);
    if (unanswered.length > 0) {
      const nextId = unanswered[0].id;
      const nextIndex = dilemmaCards.findIndex((d) => d.id === nextId);
      setCurrentDilemmaIndex(nextIndex);
    } else {
      setIsFinished(true);
    }
  }, [
    currentDilemmaIndex,
    dilemmaCards,
    selectedOption,
    currentDilemma,
    dilemmaAnswers,
    previousAnswers,
    fieldKey,
  ]);

  const moveToPrevious = useCallback(() => {
    const answeredDilemmas = dilemmaCards.filter(
      (dilemma) => dilemmaAnswers[dilemma.id]
    );

    if (answeredDilemmas.length === 0) {
      return;
    }

    const lastAnsweredDilemma = answeredDilemmas[answeredDilemmas.length - 1];
    const lastAnswer = dilemmaAnswers[lastAnsweredDilemma.id];
    const newDilemmaAnswers = { ...dilemmaAnswers };
    delete newDilemmaAnswers[lastAnsweredDilemma.id];

    setDilemmaAnswers(newDilemmaAnswers);

    // Set previous answer for this dilemma
    setPreviousAnswers((prev) => ({
      ...prev,
      [lastAnsweredDilemma.id]: lastAnswer,
    }));

    setSelectedOption(null);

    const futureUnanswered = dilemmaCards.filter(
      (dilemma) => !newDilemmaAnswers[dilemma.id]
    );
    const targetIndex = futureUnanswered.findIndex(
      (d) => d.id === lastAnsweredDilemma.id
    );

    if (targetIndex !== -1) {
      setCurrentDilemmaIndex(targetIndex);
    }
  }, [
    currentDilemmaIndex,
    unansweredDilemmas,
    currentDilemma,
    dilemmaCards,
    dilemmaAnswers,
    fieldKey,
  ]);

  const canGoBack = useCallback(() => {
    if (currentDilemmaIndex > 0) return true;

    const answeredDilemmaIds = Object.keys(dilemmaAnswers);
    return answeredDilemmaIds.length > 0;
  }, [currentDilemmaIndex, dilemmaAnswers]);

  const handleNextClick = useCallback(() => {
    let answerToUse = selectedOption;
    if (!answerToUse && previousAnswers[currentDilemma?.id]) {
      answerToUse = previousAnswers[currentDilemma.id] as 'a' | 'b';
    }
    if (!answerToUse || !currentDilemma) return;

    if (currentDilemma.infofieldExplanation) {
      setShowExplanationDialog(true);
    } else {
      // Set the answer if coming from previous state
      if (!selectedOption && answerToUse) {
        setDilemmaAnswers((prev) => ({
          ...prev,
          [currentDilemma.id]: answerToUse,
        }));
      }
      moveToNext();
    }
  }, [selectedOption, currentDilemma, moveToNext, previousAnswers]);

  const handleExplanationComplete = useCallback(() => {
    if (currentDilemma) {
      setExplanations((prev) => ({
        ...prev,
        [currentDilemma.id]: explanations[currentDilemma.id] || '',
      }));
    }
    setShowExplanationDialog(false);
    moveToNext();
  }, [moveToNext, currentDilemma, explanations]);

  const handleAnswerChange = (dilemmaId: string, newAnswer: 'a' | 'b') => {
    const newAnswers = {
      ...dilemmaAnswers,
      [dilemmaId]: newAnswer,
    };
    setDilemmaAnswers(newAnswers);
  };

  const handleExplanationChange = (dilemmaId: string, explanation: string) => {
    setExplanations((prev) => ({
      ...prev,
      [dilemmaId]: explanation,
    }));
  };

  const goBackToDilemmas = useCallback(() => {
    const answeredDilemmas = dilemmaCards.filter(
      (dilemma) => dilemmaAnswers[dilemma.id]
    );

    if (answeredDilemmas.length > 0) {
      // Ga terug naar het laatste beantwoorde dilemma en maak het onbeantwoord
      const lastAnsweredDilemma = answeredDilemmas[answeredDilemmas.length - 1];
      const lastAnswer = dilemmaAnswers[lastAnsweredDilemma.id];
      const newDilemmaAnswers = { ...dilemmaAnswers };
      delete newDilemmaAnswers[lastAnsweredDilemma.id];

      setDilemmaAnswers(newDilemmaAnswers);

      // Set previous answer for this dilemma
      setPreviousAnswers((prev) => ({
        ...prev,
        [lastAnsweredDilemma.id]: lastAnswer,
      }));

      // Bereken welke dilemma's nog niet beantwoord zijn na deze wijziging
      const futureUnanswered = dilemmaCards.filter(
        (dilemma) => !newDilemmaAnswers[dilemma.id]
      );
      const targetIndex = futureUnanswered.findIndex(
        (d) => d.id === lastAnsweredDilemma.id
      );

      setCurrentDilemmaIndex(targetIndex !== -1 ? targetIndex : 0);
    } else {
      setCurrentDilemmaIndex(0);
    }

    setIsFinished(false);
    setSelectedOption(null);
  }, [dilemmaCards, dilemmaAnswers, fieldKey]);

  useEffect(() => {
    if (onChange) {
      const combinedAnswers: valueObject = dilemmaCards
        .map((card) => {
          const answer = dilemmaAnswers[card.id] || '';
          const title = card[answer as 'a' | 'b']?.title || '';

          return {
            dilemmaId: card.id,
            answer: answer,
            title: title,
            explanation: explanations[card.id] || '',
          };
        })
        .filter((item) => item.answer !== undefined);

      onChange({ name: fieldKey, value: combinedAnswers });
    }
  }, [dilemmaAnswers, explanations, fieldKey, dilemmaCards, onChange]);

  useEffect(() => {
    setCurrentDilemmaIndex(0);
    setSelectedOption(null);

    const unanswered = getUnansweredDilemmas();
    setIsFinished(unanswered.length === 0);
  }, [
    dilemmas,
    dilemmaCards,
    getUnansweredDilemmas,
    setCurrentDilemmaIndex,
    setSelectedOption,
    setIsFinished,
  ]);

  if (isFinished || unansweredDilemmas.length === 0) {
    return (
      <div
        aria-live="polite"
        className="dilemma-field dilemma-finished"
        role="region">
        <div className="dilemma-finished-content">
          <div className="dilemma-intro">
            <Heading level={2}>Gemaakte keuzes</Heading>
            <Paragraph>Bekijk en wijzig waar nodig de antwoorden.</Paragraph>
          </div>

          <div className="dilemma-actions">
            <button
              aria-label="Ga terug naar dilemma's"
              className="dilemma-back-button"
              onClick={(e) => (e.preventDefault(), goBackToDilemmas())}
              type="button">
              Terug
            </button>
          </div>

          <div className="dilemma-summary">
            {dilemmaCards
              .filter((dilemma) => dilemmaAnswers[dilemma.id])
              .map((dilemma) => {
                const answer = dilemmaAnswers[dilemma.id] || '';

                return (
                  <div className="dilemma-summary-item" key={dilemma.id}>
                    <div className="dilemma-summary-content">
                      <div className="dilemma-summary-option">
                        <button
                          aria-label={`Kies optie A: ${dilemma.a.title}`}
                          className={`dilemma-summary-btn ${
                            answer === 'a' ? 'active' : ''
                          }`}
                          onClick={(e) => (
                            e.preventDefault(),
                            handleAnswerChange(dilemma.id, 'a')
                          )}>
                          <figure className="dilemma-option-image">
                            <img alt={dilemma.a.title} src={dilemma.a.image} />
                          </figure>
                          <div className="dilemma-option-content">
                            <Heading appearance="utrecht-heading-4" level={3}>
                              {dilemma.a.title}
                            </Heading>
                            <Paragraph>{dilemma.a.description}</Paragraph>
                          </div>
                        </button>
                      </div>

                      <div className="dilemma-summary-option">
                        <button
                          aria-label={`Kies optie B: ${dilemma.b.title}`}
                          className={`dilemma-summary-btn ${
                            answer === 'b' ? 'active' : ''
                          }`}
                          onClick={(e) => (
                            e.preventDefault(),
                            handleAnswerChange(dilemma.id, 'b')
                          )}>
                          <figure className="dilemma-option-image">
                            <img alt={dilemma.b.title} src={dilemma.b.image} />
                          </figure>
                          <div className="dilemma-option-content">
                            <Heading appearance="utrecht-heading-4" level={3}>
                              {dilemma.b.title}
                            </Heading>
                            <Paragraph>{dilemma.b.description}</Paragraph>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="dilemma-summary-explanation">
                      <textarea
                        id={`explanation-${dilemma.id}`}
                        onChange={(e) =>
                          handleExplanationChange(dilemma.id, e.target.value)
                        }
                        placeholder="Voeg een korte uitleg (niet verplicht) toe..."
                        rows={3}
                        value={explanations[dilemma.id] || ''}
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
    <div
      aria-invalid={
        required && !dilemmaAnswers[currentDilemma.id] ? 'true' : 'false'
      }
      aria-label="Dilemma keuze"
      className={`dilemma-field ${infofieldExplanation ? '--explanation' : ''}`}
      data-required={required}
      role="region">
      <div className="dilemma-intro">
        <Heading dangerouslySetInnerHTML={{ __html: title || '' }} level={2} />
        <div className="dilemma-progress">
          <span>
            {currentIndex + 1} van {dilemmas.length}
          </span>
        </div>
      </div>

      <div className="dilemma-options">
        <span aria-hidden="true" className="dilemma-label">
          <span>OF</span>
        </span>

        <div
          className={`dilemma-option${
            previousAnswers[currentDilemma.id] === 'a'
              ? ' --previous-awnser'
              : ''
          }`}>
          <input
            checked={
              selectedOption === 'a' ||
              (!selectedOption && previousAnswers[currentDilemma.id] === 'a')
            }
            id={`option-${currentDilemma.id}-a`}
            name={`dilemma-option-${currentDilemma.id}`}
            onChange={() => handleOptionSelect('a')}
            onClick={() => handleOptionSelect('a')}
            type="radio"
            value="a"
          />
          <label htmlFor={`option-${currentDilemma.id}-a`}>
            <figure className="dilemma-option-image">
              <img alt={currentDilemma.a.title} src={currentDilemma.a.image} />
            </figure>
            <div className="dilemma-option-content">
              <Heading
                appearance="utrecht-heading-4"
                dangerouslySetInnerHTML={{ __html: currentDilemma.a.title }}
                level={3}
              />
              <Paragraph
                dangerouslySetInnerHTML={{
                  __html: currentDilemma.a.description,
                }}
              />
            </div>
          </label>
        </div>

        <div
          className={`dilemma-option${
            previousAnswers[currentDilemma.id] === 'b'
              ? ' --previous-awnser'
              : ''
          }`}>
          <input
            checked={
              selectedOption === 'b' ||
              (!selectedOption && previousAnswers[currentDilemma.id] === 'b')
            }
            id={`option-${currentDilemma.id}-b`}
            name={`dilemma-option-${currentDilemma.id}`}
            onChange={() => handleOptionSelect('b')}
            onClick={() => handleOptionSelect('b')}
            type="radio"
            value="b"
          />
          <label htmlFor={`option-${currentDilemma.id}-b`}>
            <figure className="dilemma-option-image">
              <img alt={currentDilemma.b.title} src={currentDilemma.b.image} />
            </figure>
            <div className="dilemma-option-content">
              <Heading
                appearance="utrecht-heading-4"
                dangerouslySetInnerHTML={{ __html: currentDilemma.b.title }}
                level={3}
              />
              <Paragraph
                dangerouslySetInnerHTML={{
                  __html: currentDilemma.b.description,
                }}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="dilemma-actions">
        <button
          aria-expanded={infoDialog}
          className="more-info-btn dilemma-info-button"
          disabled={!currentDilemma?.infoField}
          onClick={(e) => (e.preventDefault(), setInfoDialog(true))}
          type="button">
          <span>Info</span>
        </button>

        <div className="dilemma-navigation-buttons">
          <button
            aria-label="Ga terug naar vorige vraag"
            className="dilemma-back-button"
            disabled={!canGoBack()}
            onClick={(e) => (e.preventDefault(), moveToPrevious())}
            type="button">
            Terug
          </button>

          <button
            className="dilemma-next-button"
            disabled={
              !(
                selectedOption ||
                previousAnswers[currentDilemma.id] === 'a' ||
                previousAnswers[currentDilemma.id] === 'b'
              )
            }
            onClick={(e) => (e.preventDefault(), handleNextClick())}
            type="button">
            <span className="sr-only">Volgende</span>
          </button>
        </div>
      </div>

      {showExplanationDialog ? (
        <div
          aria-labelledby="explanation-dialog-title"
          aria-modal="true"
          className="explanation-dialog"
          role="dialog">
          <div className="explanation-dialog-content">
            <Heading id="explanation-dialog-title" level={3}>
              Korte uitleg
            </Heading>
            <Paragraph>Zodat we beter begrijpen wat belangrijk is.</Paragraph>
            <textarea
              autoFocus
              onChange={(e) =>
                handleExplanationChange(currentDilemma.id, e.target.value)
              }
              placeholder="Ik maak deze keuze, omdat..."
              rows={5}
              value={explanations[currentDilemma.id] || ''}
            />
            <Button
              appearance="primary-action-button"
              onClick={handleExplanationComplete}>
              Antwoord verzenden
            </Button>
            <Button
              appearance="secondary-action-button"
              onClick={() => (
                handleExplanationComplete(),
                handleExplanationChange(currentDilemma.id, '')
              )}>
              Overslaan
            </Button>
          </div>
        </div>
      ) : null}

      <div aria-hidden={!infoDialog} className="info-card dilemma-info-field">
        <div className="info-card-container">
          <Paragraph
            dangerouslySetInnerHTML={{
              __html: currentDilemma?.infoField || '',
            }}
          />
          <button
            className="utrecht-button utrecht-button--primary-action"
            onClick={(e) => (e.preventDefault(), setInfoDialog(false))}
            type="button">
            Snap ik
          </button>
        </div>
      </div>
    </div>
  );
};
export { DilemmaField };
export default DilemmaField;
