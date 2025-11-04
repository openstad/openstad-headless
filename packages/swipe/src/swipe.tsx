import './swipe.scss';
import React, { useState, useEffect, useMemo, FC, useCallback } from 'react';
import type { BaseProps } from '@openstad-headless/types';
import {Heading, Paragraph, Button, Textarea} from '@utrecht/component-library-react';
import { FormValue } from '@openstad-headless/form/src/form';

export type SwipeCard = {
  id: string;
  title: string;
  infoField?: string;
  image?: string;
  explanationRequired?: boolean;
};

export type SwipeWidgetProps = BaseProps &
  SwipeProps & {
  resourceId?: string;
  resourceIdRelativePath?: string;
};

export type SwipeProps = {
  cards?: SwipeCard[];
  onSwipeRight?: (card: SwipeCard) => void;
  onSwipeLeft?: (card: SwipeCard) => void;
  showButtons?: boolean;
  enableKeyboard?: boolean;
  fieldKey: string;
  type?: string;
  required?: boolean;
  overrideDefaultValue?: FormValue;
  onChange?: (e: { name: string, value: FormValue }, triggerSetLastKey?: boolean) => void;
  agreeText?: string;
  disagreeText?: string;
};

// Default demo cards - moved outside component to prevent recreation
const defaultCards: SwipeCard[] = [
  {
    id: '1',
    title: 'Iedere wijk in Den Haag moet evenveel sportmogelijkheden hebben.',
    image: 'https://picsum.photos/seed/1752819645426/400/600'
  },
  {
    id: '2',
    title: 'Lorem ipsum dolor sit amet, consecdidunt ut labore et dolore magna aliqua.',
    image: 'https://picsum.photos/seed/17528196455426/400/600'
  },
  {
    id: '3',
    title: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: 'https://picsum.photos/seed/17528139645426/400/600'
  },
  {
    id: '4',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
    image: 'https://picsum.photos/seed/17528119645426/400/600'
  },
  {
    id: '5',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: 'https://picsum.photos/seed/175281679645426/400/600'
  },
];

type defaultValueObject = Array< { cardId: string; answer: string; explanation?: string } >;

const SwipeField: FC<SwipeWidgetProps> = ({
                                            cards = defaultCards,
                                            onSwipeLeft,
                                            onSwipeRight,
                                            showButtons = true,
                                            enableKeyboard = true,
                                            required = false,
                                            onChange,
                                            fieldKey,
                                            agreeText = 'Eens',
                                            disagreeText = 'Oneens',
                                            overrideDefaultValue,
                                          }) => {
  // Initialize data
  const swipeCards = useMemo(() => cards.length > 0 ? cards : defaultCards, [cards]);

  let initialAnswers: Record<string, string> = {};
  let initialAnswersExplanation: Record<string, string> = {};

  if (overrideDefaultValue && typeof overrideDefaultValue === 'object') {
    const overrideArray = overrideDefaultValue as defaultValueObject;
    overrideArray.forEach(item => {
      initialAnswers[item.cardId as string] = item.answer;
      if (item.explanation) {
        initialAnswersExplanation[item.cardId as string] = item.explanation;
      }
    });
  }

  // Core swipe state
  const [remainingCards, setRemainingCards] = useState<SwipeCard[]>(swipeCards);
  const [swipeAnswers, setSwipeAnswers] = useState<Record<string, string>>(initialAnswers);
  const [swipeAnswersExplanation, setSwipeAnswersExplanation] = useState<Record<string, string>>(initialAnswersExplanation);
  const [isFinished, setIsFinished] = useState(false);

  // Animation state
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Drag state
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  // UI state
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [explanationCardId, setExplanationCardId] = useState('');
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  // Pending swipe for explanation dialogs
  const [pendingSwipe, setPendingSwipe] = useState<{card: SwipeCard, direction: string} | null>(null);

  // Helper function to get unanswered cards
  const getUnansweredCards = useCallback(() =>
      remainingCards.filter(card => !initialAnswers[card.id]),
    [remainingCards, initialAnswers]
  );

  // Helper function to complete a swipe animation
  const completeSwipe = useCallback((card: SwipeCard, direction: string) => {
    setTimeout(() => {
      setSwipeAnswers(prev => ({
        ...prev,
        [card.id]: direction
      }));
      removeCurrentCard();
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 200);
  }, []);

  // Helper function to close explanation dialog and complete swipe
  const closeExplanationDialog = useCallback(() => {
    setIsDialogClosing(true);
    setTimeout(() => {
      setShowExplanationDialog(false);
      setIsDialogClosing(false);
      setTimeout(() => {
        if (pendingSwipe) {
          setSwipeAnswers(prev => ({
            ...prev,
            [pendingSwipe.card.id]: pendingSwipe.direction
          }));
          setPendingSwipe(null);
        }
        removeCurrentCard();
        setSwipeDirection(null);
        setIsAnimating(false);
      }, 200);
    }, 200);
  }, [pendingSwipe]);

  // Initialize remaining cards when cards prop changes
  useEffect(() => {
    setRemainingCards(swipeCards);
    setIsFinished(false);
  }, [swipeCards]);

  // Keyboard handling
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handleSwipeLeft();
      } else if (event.key === 'ArrowRight') {
        handleSwipeRight();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [enableKeyboard, getUnansweredCards, isAnimating]);

  const handleSwipeLeft = () => {
    const unansweredCards = getUnansweredCards();
    if (unansweredCards.length > 0 && !isAnimating) {
      const currentCard = unansweredCards[0];

      setIsAnimating(true);
      setSwipeDirection(disagreeText);

      onSwipeLeft?.(currentCard);

      if (currentCard.explanationRequired) {
        setPendingSwipe({card: currentCard, direction: disagreeText});
        setShowExplanationDialog(true);
      } else {
        completeSwipe(currentCard, disagreeText);
      }
    }
  };

  const handleSwipeRight = () => {
    const unansweredCards = getUnansweredCards();
    if (unansweredCards.length > 0 && !isAnimating) {
      const currentCard = unansweredCards[0];

      setIsAnimating(true);
      setSwipeDirection(agreeText);

      onSwipeRight?.(currentCard);

      if (currentCard.explanationRequired) {
        setPendingSwipe({card: currentCard, direction: agreeText});
        setShowExplanationDialog(true);
        setExplanationCardId( currentCard.id );
      } else {
        completeSwipe(currentCard, agreeText);
      }
    }
  };

  const removeCurrentCard = () => {
    setIsInfoVisible(false);

    setRemainingCards(prev => {
      const currentUnanswered = prev.filter(card => !initialAnswers[card.id]);
      if (currentUnanswered.length === 0) return prev;

      // Find and remove the current card that was swiped
      const currentCard = currentUnanswered[0];
      const newCards = prev.filter(card => card.id !== currentCard.id);

      // Check if there are any unanswered cards left
      const remainingUnanswered = newCards.filter(card => !initialAnswers[card.id] && !swipeAnswers[card.id]);
      if (remainingUnanswered.length === 0) {
        setIsFinished(true);
      }
      return newCards;
    });
  };

  // Function to clean up drag state and release pointer capture
  const cleanupDragState = useCallback((element: Element | null, pointerId?: number) => {
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
    });

    // Force release pointer capture if element and pointerId are available
    if (element && pointerId !== undefined) {
      try {
        (element as any).releasePointerCapture(pointerId);
      } catch (error) {
        // Ignore errors when releasing capture
      }
    }
  }, []);

  // Touch/Mouse event handlers
  const handlePointerDown = (event: React.PointerEvent) => {
    if (isAnimating || getUnansweredCards().length === 0) return;

    const clientX = event.clientX;
    const clientY = event.clientY;

    setDragState({
      isDragging: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      deltaX: 0,
      deltaY: 0,
    });

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragState.isDragging) return;

    // If animation starts during drag, immediately stop dragging
    if (isAnimating) {
      cleanupDragState(event.currentTarget, event.pointerId);
      return;
    }

    const clientX = event.clientX;
    const clientY = event.clientY;
    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;

    setDragState(prev => ({
      ...prev,
      currentX: clientX,
      currentY: clientY,
      deltaX,
      deltaY,
    }));

    // Set swipe direction for visual feedback
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? agreeText : disagreeText);
    } else {
      setSwipeDirection(null);
    }
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    if (!dragState.isDragging) return;

    const swipeThreshold = 100;
    const velocityThreshold = 0.5;

    const velocity = Math.abs(dragState.deltaX) / 100;

    // Clean up drag state first
    cleanupDragState(event.currentTarget, event.pointerId);

    // Don't trigger swipe if already animating
    if (isAnimating) return;

    // Determine if swipe should trigger action
    const shouldSwipe = Math.abs(dragState.deltaX) > swipeThreshold || velocity > velocityThreshold;

    if (shouldSwipe) {
      if (dragState.deltaX > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else {
      // Snap back
      setSwipeDirection(null);
    }
  };

  const handlePointerCancel = (event: React.PointerEvent) => {
    // Handle cases where pointer is cancelled (e.g., browser takes over)
    cleanupDragState(event.currentTarget, event.pointerId);
    setSwipeDirection(null);
  };

  const handlePointerLeave = (event: React.PointerEvent) => {
    // Handle cases where pointer leaves the element
    if (dragState.isDragging) {
      cleanupDragState(event.currentTarget, event.pointerId);
      setSwipeDirection(null);
    }
  };


  const handleAnswerChange = (cardId: string, newAnswer: string) => {
    setSwipeAnswers(prev => ({
      ...prev,
      [cardId]: newAnswer
    }));
  };

  const handleAnswerExplanationChange = (cardId: string, newAnswer: string) => {
    setSwipeAnswersExplanation(prev => ({
      ...prev,
      [cardId]: newAnswer
    }));
  };

  useEffect(() => {
    if (onChange) {
      const combinedAnswers: defaultValueObject = swipeCards.map(card => ({
        cardId: card.id,
        answer: swipeAnswers[card.id],
        title: card.title || '',
        explanation: swipeAnswersExplanation[card.id] || '',
      })).filter(item => item.answer !== undefined);

      onChange({ name: fieldKey, value: combinedAnswers });
    }
  }, [swipeAnswers, swipeAnswersExplanation]);

  // Get cards that haven't been answered yet
  const unansweredCards = getUnansweredCards();

  // If no unanswered cards remain, show finished state
  if (isFinished || unansweredCards.length === 0) {
    return (
      <div className="swipe-widget swipe-finished" role="region" aria-live="polite" tabIndex={0}>
        <div className="swipe-finished-content">
          <h2>Jouw antwoorden</h2>
          <p>Bekijk en wijzig eventueel je antwoorden op de stellingen:</p>

          <div className="swipe-summary">
            {swipeCards.map((card) => {
              const answer = swipeAnswers[card.id];
              return (
                <div key={card.id} className="swipe-summary-item">
                  <div className="swipe-summary-content">
                    <div className="swipe-summary-question">
                      {card.image && (
                        <div className="swipe-summary-image">
                          <img src={card.image} alt="" />
                        </div>
                      )}
                      <p>{card.title}</p>
                    </div>
                    <div className="swipe-summary-answer">
                      <div className="swipe-summary-buttons">
                        <button
                          className={`swipe-summary-btn ${answer === disagreeText ? 'active' : ''}`}
                          onClick={(e) => ( e.preventDefault(), handleAnswerChange(card.id, disagreeText))}
                          aria-label={`Oneens met: ${card.title}`}
                        >
                          <i className="ri-thumb-down-fill"></i>
                          <span>Oneens</span>
                        </button>
                        <button
                          className={`swipe-summary-btn ${answer === agreeText ? 'active' : ''}`}
                          onClick={(e) => (e.preventDefault(), handleAnswerChange(card.id, agreeText))}
                          aria-label={`Eens met: ${card.title}`}
                        >
                          <i className="ri-thumb-up-fill"></i>
                          <span>Eens</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="swipe-summary-explanation">
                    <Textarea
                      id={`explanation-${card.id}`}
                      placeholder="Voeg hier een toelichting (optioneel) toe..."
                      value={swipeAnswersExplanation[card.id] || ''}
                      onChange={(e) => handleAnswerExplanationChange(card.id, e.target.value)}
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

  return (
    <div className="swipe-widget" role="region" aria-label="Swipe widget" tabIndex={0} aria-invalid={!required && Object.keys(swipeAnswers).length === 0 ? 'false' : 'true'} data-required={required}>
      <div className="swipe-container" role="list" aria-label="Stellingen">
        <div className="swipe-stack">
          {unansweredCards.slice(0, 3).map((card, index) => {
            const isTop = index === 0;
            const zIndex = unansweredCards.length - index;
            let transform = '';
            if (isTop && dragState.isDragging) {
              const rotation = dragState.deltaX * 0.1;
              transform = `translate(${dragState.deltaX}px, ${dragState.deltaY * 0.5}px) rotate(${rotation}deg)`;
            } else if (isTop && swipeDirection && isAnimating) {
              const direction = swipeDirection === agreeText ? 1 : -1;
              transform = `translateX(${direction * 150}px) rotate(${direction * 10}deg)`;
            }
            return (
              <>
                <div
                  key={card.id}
                  className={`swipe-card ${isTop ? 'swipe-card--top' : ''} ${swipeDirection && isTop ? `swipe-card--${swipeDirection}` : ''} ${isAnimating && isTop ? 'swipe-card--animating' : ''}`}
                  style={{ zIndex, transform }}
                  {...(isTop && /iPad|iPhone|iPod|Android/i.test(navigator.userAgent)
                    ? {
                      onTouchStart: (e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        setDragState({
                          isDragging: true,
                          startX: touch.clientX,
                          startY: touch.clientY,
                          currentX: touch.clientX,
                          currentY: touch.clientY,
                          deltaX: 0,
                          deltaY: 0,
                        });
                      },
                      onTouchMove: (e) => {
                        e.preventDefault();
                        if (!dragState.isDragging) return;
                        const touch = e.touches[0];
                        const deltaX = touch.clientX - dragState.startX;
                        const deltaY = touch.clientY - dragState.startY;
                        setDragState(prev => ({
                          ...prev,
                          currentX: touch.clientX,
                          currentY: touch.clientY,
                          deltaX,
                          deltaY,
                        }));
                        if (Math.abs(deltaX) > 50) {
                          setSwipeDirection(deltaX > 0 ? agreeText : disagreeText);
                        } else {
                          setSwipeDirection(null);
                        }
                      },
                      onTouchEnd: (e) => {
                        e.preventDefault();
                        if (!dragState.isDragging) return;
                        const swipeThreshold = 100;
                        const velocityThreshold = 0.5;
                        const deltaX = dragState.deltaX;
                        const velocity = Math.abs(deltaX) / 100;
                        setDragState({
                          isDragging: false,
                          startX: 0,
                          startY: 0,
                          currentX: 0,
                          currentY: 0,
                          deltaX: 0,
                          deltaY: 0,
                        });
                        if (isAnimating) return;
                        const shouldSwipe = Math.abs(deltaX) > swipeThreshold || velocity > velocityThreshold;
                        if (shouldSwipe) {
                          if (deltaX > 0) {
                            handleSwipeRight();
                          } else {
                            handleSwipeLeft();
                          }
                        } else {
                          setSwipeDirection(null);
                        }
                      }
                    }
                    : {
                      onPointerDown: handlePointerDown,
                      onPointerMove: handlePointerMove,
                      onPointerUp: handlePointerUp,
                      onPointerCancel: handlePointerCancel,
                      onPointerLeave: handlePointerLeave
                    })}
                  role="listitem"
                  aria-label={card.title}
                  tabIndex={isTop ? 0 : -1}
                  aria-describedby={`swipe-card-desc-${card.id}`}
                >
                  {card.image && (
                    <div className="swipe-card-image">
                      <img src={card.image} alt={card.title || `afbeelding voor: ${card.title}`} />
                    </div>
                  )}
                  <div className="swipe-card-content">
                    <Paragraph className="swipe-card-description" id={`swipe-card-desc-${card.id}`}>{card.title}</Paragraph>
                  </div>


                  {isTop && swipeDirection && (
                    <div className={`swipe-indicator swipe-indicator--${swipeDirection}`} aria-live="polite" aria-label={swipeDirection === disagreeText ? 'Afwijzen' : 'Goedkeuren'}>
                      {swipeDirection === disagreeText ? (
                        <i className="ri-thumb-down-fill"></i>

                      ) : (
                        <i className="ri-thumb-up-fill"></i>
                      )}
                    </div>
                  )}
                </div>
                {card.infoField && (
                  <div className="info-card" aria-hidden={!isInfoVisible ? 'true' : 'false'} onClick={() => { setIsInfoVisible(false); }}>
                    <div className="info-card-container">
                      <Paragraph>
                        {card.infoField}
                      </Paragraph>

                      <Button appearance="primary-action-button" onClick={() => { setIsInfoVisible(false); }}>Snap ik</Button>
                    </div>
                  </div>
                )}
              </>
            );
          })}
        </div>
      </div>
      {showButtons && (
        <div className="swipe-actions" role="group" aria-label="Acties">
          <button
            className="swipe-btn swipe-btn-pass"
            onClick={(e) => (e.preventDefault(), handleSwipeLeft())}
            disabled={unansweredCards.length === 0}
            aria-label="Afwijzen"
          >
            <i className="ri-thumb-down-fill"></i>
            <span>Oneens</span>
          </button>
          <button
            className="swipe-info-btn"
            onClick={(e) => (e.preventDefault(), setIsInfoVisible(!isInfoVisible))}
            disabled={!unansweredCards[0]?.infoField}
            aria-label="Toon info"
          >
            <span>Info</span>
          </button>
          <button
            className="swipe-btn swipe-btn-like"
            onClick={(e) => (e.preventDefault(), handleSwipeRight())}
            disabled={unansweredCards.length === 0}
            aria-label="Goedkeuren"
          >
            <i className="ri-thumb-up-fill"></i>
            <span>Eens</span>
          </button>
        </div>
      )}

      {(showExplanationDialog && explanationCardId) && (
        <div className={`explanation-dialog ${isDialogClosing ? 'explanation-dialog--closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="explanation-dialog-title">
          <div className="explanation-dialog-content">
            <Heading level={3} id="explanation-dialog-title">Kun je kort uitleggen waarom dit belangrijk is voor jou?</Heading>
            <Paragraph> Zo begrijpen we beter wat jongeren écht nodig hebben in de wijk.</Paragraph>

            <Textarea
              autoFocus
              placeholder='Toelichting...'
              rows={5}
              name={ 'dilemma-explanation' }
              value={ swipeAnswersExplanation[explanationCardId] || '' }
              onChange={(e) => { handleAnswerExplanationChange(explanationCardId, e.target.value); }}
            />

            <Button appearance="primary-action-button" onClick={closeExplanationDialog}>
              Antwoord verzenden
            </Button>
            <Button appearance="secondary-action-button" onClick={closeExplanationDialog}>
              Sluiten zonder toelichting
            </Button>
          </div>
        </div>
      )}
    </div >
  );
}
export { SwipeField };
export default SwipeField;