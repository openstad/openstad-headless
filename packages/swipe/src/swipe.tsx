import './swipe.scss';
import React, { useState, useEffect, useMemo, FC, useCallback, useRef } from 'react';
import type { BaseProps } from '@openstad-headless/types';
import { Heading, Paragraph, Button } from '@utrecht/component-library-react';
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

const SwipeField: FC<SwipeWidgetProps> = ({
  cards = defaultCards,
  onSwipeLeft,
  onSwipeRight,
  showButtons = true,
  enableKeyboard = true,
  required = false,
  onChange,
  fieldKey,
  overrideDefaultValue,
}) => {
  // Initialize data
  const swipeCards = useMemo(() => cards.length > 0 ? cards : defaultCards, [cards]);
  const initialAnswers = overrideDefaultValue ? (overrideDefaultValue as Record<string, 'left' | 'right'>) : {};

  // Core swipe state
  const [remainingCards, setRemainingCards] = useState<SwipeCard[]>(swipeCards);
  const [swipeAnswers, setSwipeAnswers] = useState<Record<string, 'left' | 'right'>>(initialAnswers);
  const [isFinished, setIsFinished] = useState(false);

  // Animation state
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Drag state using ref for better performance
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  });

  const [dragTransform, setDragTransform] = useState<string>('');
  const animationFrameRef = useRef<number | null>(null);

  // UI state
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  // Pending swipe for explanation dialogs
  const [pendingSwipe, setPendingSwipe] = useState<{ card: SwipeCard, direction: 'left' | 'right' } | null>(null);

  // Helper function to get unanswered cards
  const getUnansweredCards = useCallback(() =>
    remainingCards.filter(card => !initialAnswers[card.id]),
    [remainingCards, initialAnswers]
  );

  // Helper function to complete a swipe animation
  const completeSwipe = useCallback((card: SwipeCard, direction: 'left' | 'right') => {
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

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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

  const handleSwipeLeft = useCallback(() => {
    const unansweredCards = getUnansweredCards();
    if (unansweredCards.length > 0 && !isAnimating) {
      const currentCard = unansweredCards[0];

      setIsAnimating(true);
      setSwipeDirection('left');

      onSwipeLeft?.(currentCard);

      if (currentCard.explanationRequired) {
        setPendingSwipe({ card: currentCard, direction: 'left' });
        setShowExplanationDialog(true);
      } else {
        completeSwipe(currentCard, 'left');
      }
    }
  }, [getUnansweredCards, isAnimating, onSwipeLeft, completeSwipe]);

  const handleSwipeRight = useCallback(() => {
    const unansweredCards = getUnansweredCards();
    if (unansweredCards.length > 0 && !isAnimating) {
      const currentCard = unansweredCards[0];

      setIsAnimating(true);
      setSwipeDirection('right');

      onSwipeRight?.(currentCard);

      if (currentCard.explanationRequired) {
        setPendingSwipe({ card: currentCard, direction: 'right' });
        setShowExplanationDialog(true);
      } else {
        completeSwipe(currentCard, 'right');
      }
    }
  }, [getUnansweredCards, isAnimating, onSwipeRight, completeSwipe]);

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
    dragStateRef.current = {
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
    };

    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setDragTransform('');
    setSwipeDirection(null);

    // Force release pointer capture if element and pointerId are available
    if (element && pointerId !== undefined) {
      try {
        (element as any).releasePointerCapture(pointerId);
      } catch (error) {
        // Ignore errors when releasing capture
      }
    }
  }, []);

  // Optimized function to update transform with requestAnimationFrame
  const updateDragTransform = useCallback((deltaX: number, deltaY: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const rotation = deltaX * 0.1;
      const transform = `translate(${deltaX}px, ${deltaY * 0.5}px) rotate(${rotation}deg)`;
      setDragTransform(transform);

      // Set swipe direction for visual feedback
      if (Math.abs(deltaX) > 50) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }
    });
  }, []);

  // Touch/Mouse event handlers
  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (isAnimating || getUnansweredCards().length === 0) return;

    const clientX = event.clientX;
    const clientY = event.clientY;

    dragStateRef.current = {
      isDragging: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      deltaX: 0,
      deltaY: 0,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }, [isAnimating, getUnansweredCards]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    const dragState = dragStateRef.current;
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

    // Update drag state without triggering re-render
    dragStateRef.current = {
      ...dragState,
      currentX: clientX,
      currentY: clientY,
      deltaX,
      deltaY,
    };

    // Use requestAnimationFrame for smooth visual updates
    updateDragTransform(deltaX, deltaY);

    event.preventDefault();
  }, [isAnimating, cleanupDragState, updateDragTransform]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging) return;

    const swipeThreshold = 100;
    const velocityThreshold = 0.5;

    const velocity = Math.abs(dragState.deltaX) / 100;
    const deltaX = dragState.deltaX;

    // Clean up drag state first
    cleanupDragState(event.currentTarget, event.pointerId);

    // Don't trigger swipe if already animating
    if (isAnimating) return;

    // Determine if swipe should trigger action
    const shouldSwipe = Math.abs(deltaX) > swipeThreshold || velocity > velocityThreshold;

    if (shouldSwipe) {
      if (deltaX > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else {
      // Snap back
      setSwipeDirection(null);
    }
  }, [isAnimating, cleanupDragState, handleSwipeRight, handleSwipeLeft]);

  const handlePointerCancel = useCallback((event: React.PointerEvent) => {
    // Handle cases where pointer is cancelled (e.g., browser takes over)
    cleanupDragState(event.currentTarget, event.pointerId);
  }, [cleanupDragState]);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    // Handle cases where pointer leaves the element
    if (dragStateRef.current.isDragging) {
      cleanupDragState(event.currentTarget, event.pointerId);
    }
  }, [cleanupDragState]);


  const handleAnswerChange = (cardId: string, newAnswer: 'left' | 'right') => {
    setSwipeAnswers(prev => ({
      ...prev,
      [cardId]: newAnswer
    }));
  };

  const handleExplanationChange = (cardId: string, explanation: string) => {
    setExplanations(prev => ({
      ...prev,
      [cardId]: explanation
    }));
  };

  useEffect(() => {
    if (onChange) {
      onChange({ name: fieldKey, value: swipeAnswers });
    }
  }, [swipeAnswers]);

  // Get cards that haven't been answered yet
  const unansweredCards = getUnansweredCards();

  // Calculate current index (how many cards have been answered)
  const currentIndex = swipeCards.length - unansweredCards.length;

  // If no unanswered cards remain, show finished state
  if (isFinished || unansweredCards.length === 0) {
    return (
      <div className="swipe-widget swipe-finished" role="region" aria-live="polite" tabIndex={0}>
        <div className="swipe-finished-content">
          <Heading level={2}>Jouw antwoorden</Heading>
          <Paragraph>Bekijk en wijzig eventueel je antwoorden op de stellingen:</Paragraph>

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
                          className={`swipe-summary-btn ${answer === 'left' ? 'active' : ''}`}
                          onClick={(e) => (e.preventDefault(), handleAnswerChange(card.id, 'left'))}
                          aria-label={`Oneens met: ${card.title}`}
                        >
                          <i className="ri-thumb-down-fill"></i>
                          <span>Oneens</span>
                        </button>
                        <button
                          className={`swipe-summary-btn ${answer === 'right' ? 'active' : ''}`}
                          onClick={(e) => (e.preventDefault(), handleAnswerChange(card.id, 'right'))}
                          aria-label={`Eens met: ${card.title}`}
                        >
                          <i className="ri-thumb-up-fill"></i>
                          <span>Eens</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="swipe-summary-explanation">
                    <textarea
                      id={`explanation-${card.id}`}
                      placeholder="Voeg hier een toelichting (optioneel) toe..."
                      value={explanations[card.id] || ''}
                      onChange={(e) => handleExplanationChange(card.id, e.target.value)}
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
    <>
      <div className="swipe-progress">
        <span>{currentIndex + 1} van {swipeCards.length}</span>
      </div>
      <div className="swipe-widget" role="region" aria-label="Swipe widget" tabIndex={0} aria-invalid={!required && Object.keys(swipeAnswers).length === 0 ? 'false' : 'true'} data-required={required}>

        <div className="swipe-container" role="list" aria-label="Stellingen">
          <div className="swipe-stack">
            {unansweredCards.slice(0, 3).map((card, index) => {
              const isTop = index === 0;
              const zIndex = unansweredCards.length - index;
              let transform = '';
              if (isTop && dragStateRef.current.isDragging) {
                transform = dragTransform;
              } else if (isTop && swipeDirection && isAnimating) {
                const direction = swipeDirection === 'right' ? 1 : -1;
                transform = `translateX(${direction * 150}px) rotate(${direction * 10}deg)`;
              }
              return (
                <>
                  <div
                    key={card.id}
                    className={`swipe-card ${isTop ? 'swipe-card--top' : ''} ${swipeDirection && isTop ? `swipe-card--${swipeDirection}` : ''} ${isAnimating && isTop ? 'swipe-card--animating' : ''}`}
                    style={{ zIndex, transform }}
                    {...(isTop
                      ? {
                        onPointerDown: handlePointerDown,
                        onPointerMove: handlePointerMove,
                        onPointerUp: handlePointerUp,
                        onPointerCancel: handlePointerCancel,
                        onPointerLeave: handlePointerLeave
                      }
                      : {})}
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
                      <div className={`swipe-indicator swipe-indicator--${swipeDirection}`} aria-live="polite" aria-label={swipeDirection === 'left' ? 'Afwijzen' : 'Goedkeuren'}>
                        {swipeDirection === 'left' ? (
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

        {showExplanationDialog && (
          <div className={`explanation-dialog ${isDialogClosing ? 'explanation-dialog--closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="explanation-dialog-title">
            <div className="explanation-dialog-content">
              <Heading level={3} id="explanation-dialog-title">Kun je kort uitleggen waarom dit belangrijk is voor jou?</Heading>
              <Paragraph> Zo begrijpen we beter wat jongeren écht nodig hebben in de wijk.</Paragraph>
              <textarea autoFocus placeholder='Toelichting...' rows={5} />
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
    </>
  );
}
export { SwipeField };
export default SwipeField;
