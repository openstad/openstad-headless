import './dilemma.scss';
import React, { useState, useEffect, FC, useCallback } from 'react';
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

// Default demo dilemmas
const defaultDilemmas: DilemmaCard[] = [
  {
    id: '0',
    a: {
      title: 'Bredere fietspaden',
      description: 'Maar dan verdwijnt er groen in je buurt.',
      image: 'https://picsum.photos/seed/dilemma1a/400/300'
    },
    b: {
      title: 'Meer groen',
      description: 'Maar dan worden de fietspaden smaller.',
      image: 'https://picsum.photos/seed/dilemma1b/400/300'
    }
  },
  {
    id: '1',
    a: {
      title: 'A Meer groen',
      description: 'Maar dan worden de fietspaden smaller.',
      image: 'https://picsum.photos/seed/dilemma2a/400/300'
    },
    b: {
      title: 'B Nisi adipiscing, ut eu.',
      description: 'Non reprehenderit, ut duis incididunt.',
      image: 'https://picsum.photos/seed/dilemma2b/400/300'
    }
  }
];

const DilemmaField: FC<DilemmaFieldProps> = ({
  title,
  infoField,
  infofieldExplanation,
  dilemmas = defaultDilemmas,
  setCurrentPage,
  currentPage = 0,
  required = false,
  onChange,
  fieldKey,
  overrideDefaultValue,
  ...otherProps
}) => {
  // Initialize data
  const dilemmaCards = dilemmas.length > 0 ? dilemmas : defaultDilemmas;
  const initialAnswers = overrideDefaultValue ? (overrideDefaultValue as Record<string, 'a' | 'b'>) : {};

  // Core navigation state
  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [dilemmaAnswers, setDilemmaAnswers] = useState<Record<string, 'a' | 'b'>>(initialAnswers);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | null>(null);

  // UI state
  const [infoDialog, setInfoDialog] = useState<boolean>(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState<boolean>(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  // Get current dilemma
  const currentDilemma = dilemmaCards[currentDilemmaIndex];

  // Handle option selection and navigation
  const handleOptionSelect = useCallback((option: 'a' | 'b') => {
    if (!currentDilemma) return;

    setSelectedOption(option);

    // Update answers
    const newAnswers = {
      ...dilemmaAnswers,
      [currentDilemma.id]: option
    };
    setDilemmaAnswers(newAnswers);

    // Call onChange if provided
    if (onChange) {
      onChange({ name: fieldKey, value: newAnswers });
    }

    // Show explanation dialog if required
    if (infofieldExplanation) {
      setShowExplanationDialog(true);
    } else {
      // Move to next dilemma after a short delay
      setTimeout(() => {
        moveToNext();
      }, 300);
    }
  }, [currentDilemma, dilemmaAnswers, onChange, fieldKey, infofieldExplanation]);

  const moveToNext = useCallback(() => {
    if (currentDilemmaIndex < dilemmaCards.length - 1) {
      setCurrentDilemmaIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  }, [currentDilemmaIndex, dilemmaCards.length]);

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
    setIsFinished(false);
    setSelectedOption(null);
  }, [dilemmas]);

  // If finished, show overview
  if (isFinished) {
    return (
      <div className="dilemma-field dilemma-finished" role="region" aria-live="polite" tabIndex={0}>
        <div className="dilemma-finished-content">
          <div className="dilemma-intro">
            <Heading level={2}>Jouw keuzes</Heading>
            <Paragraph>Bekijk en wijzig eventueel je antwoorden op de dilemma's:</Paragraph>
          </div>

          <div className="dilemma-summary">
            {dilemmaCards.map((dilemma) => {
              const answer = dilemmaAnswers[dilemma.id];
              const selectedOptionData = answer ? dilemma[answer] : null;
              
              return (
                <div key={dilemma.id} className="dilemma-summary-item">
                  <div className="dilemma-summary-content">
                    <div className="dilemma-summary-options">
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
                      
                      <span className="dilemma-summary-label" aria-hidden="true">
                        <span>OF</span>
                      </span>
                      
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
          <span>{currentDilemmaIndex + 1} van {dilemmaCards.length}</span>
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

      <button 
        className="more-info-btn dilemma-info-button" 
        onClick={(e) => (e.preventDefault(), setInfoDialog(true))} 
        type="button" 
        aria-expanded={infoDialog}
      >
        <span>Info</span>
      </button>

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
          <Paragraph dangerouslySetInnerHTML={{ __html: infoField || '' }} />
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
