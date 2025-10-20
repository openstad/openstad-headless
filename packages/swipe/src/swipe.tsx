import './swipe.scss';
import React, { useState, useEffect, useMemo, FC, useCallback } from 'react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
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
  onSwipeLeft = () => { console.log('Swiped LEFT'); },
  onSwipeRight = () => { console.log('Swiped RIGHT'); },
  showButtons = true,
  enableKeyboard = true,
  required = false,
  onChange,
  fieldKey,
  ...props
}) => {
  const swipeCards = useMemo(() => {
    return cards.length > 0 ? cards : defaultCards;
  }, [cards]);

  // Generate a unique key for this widget instance based on cards
  const storageKey = useMemo(() => {
    const cardIds = swipeCards.map(card => card.id).join('-');
    return `swipe-widget-state-${cardIds}`;
  }, [swipeCards]);

  // Load persisted state or use defaults (only from sessionStorage, not on page refresh)
  const loadPersistedState = useCallback(() => {
    try {
      // Only load from sessionStorage (persists during tab session, not page refresh)
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsedState = JSON.parse(saved);
        // Validate that the saved state matches current cards
        if (parsedState.cardIds && JSON.stringify(parsedState.cardIds) === JSON.stringify(swipeCards.map(c => c.id))) {
          return parsedState;
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted swipe state:', error);
    }
    return null;
  }, [storageKey, swipeCards]);

  const persistedState = loadPersistedState();

  const [currentCardIndex, setCurrentCardIndex] = useState(persistedState?.currentCardIndex ?? 0);
  const [isFinished, setIsFinished] = useState(persistedState?.isFinished ?? false);
  const [remainingCards, setRemainingCards] = useState<SwipeCard[]>(
    persistedState?.remainingCards ?? swipeCards
  );
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
  });
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [swipeAnswers, setSwipeAnswers] = useState<Record<string, 'left' | 'right'>>(
    persistedState?.swipeAnswers ?? {}
  );
  const [showSummary, setShowSummary] = useState(persistedState?.showSummary ?? false);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  // Persist state to sessionStorage (only during tab session, not across page refreshes)
  const persistState = useCallback(() => {
    try {
      const stateToSave = {
        currentCardIndex,
        isFinished,
        remainingCards,
        swipeAnswers,
        showSummary,
        cardIds: swipeCards.map(card => card.id),
        timestamp: Date.now()
      };
      sessionStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to persist swipe state:', error);
    }
  }, [currentCardIndex, isFinished, remainingCards, swipeAnswers, showSummary, swipeCards, storageKey]);

  // Handle browser visibility changes to persist/restore state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Browser tab becomes hidden - save state
        persistState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also save state before page unload (but not on refresh since sessionStorage will be cleared)
    const handleBeforeUnload = () => {
      persistState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [persistState]);

  // Initialize remaining cards when cards prop changes (only if no persisted state)
  useEffect(() => {
    if (!persistedState) {
      setRemainingCards(swipeCards);
      setCurrentCardIndex(0);
      setIsFinished(false);
    }
  }, [swipeCards, persistedState]);

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
  }, [enableKeyboard, remainingCards.length, isAnimating]);

  const handleSwipeLeft = () => {
    if (remainingCards.length > 0 && !isAnimating) {
      const currentCard = remainingCards[0];

      setIsAnimating(true);
      setSwipeDirection('left');

      // Store the answer
      setSwipeAnswers(prev => ({
        ...prev,
        [currentCard.id]: 'left'
      }));

      onSwipeLeft?.(currentCard);

      // If explanation is required, show dialog and wait for it to close
      if (currentCard.explanationRequired) {
        setShowExplanationDialog(true);
        // Animation will continue when dialog is closed - handled in the dialog close handlers
      } else {
        // No explanation required, proceed immediately with animation
        setTimeout(() => {
          removeCurrentCard();
          setSwipeDirection(null);
          setIsAnimating(false);
        }, 200);
      }
    }
  };

  const handleSwipeRight = () => {
    if (remainingCards.length > 0 && !isAnimating) {
      const currentCard = remainingCards[0];

      setIsAnimating(true);
      setSwipeDirection('right');

      // Store the answer
      setSwipeAnswers(prev => ({
        ...prev,
        [currentCard.id]: 'right'
      }));

      onSwipeRight?.(currentCard);

      // If explanation is required, show dialog and wait for it to close
      if (currentCard.explanationRequired) {
        setShowExplanationDialog(true);
        // Animation will continue when dialog is closed - handled in the dialog close handlers
      } else {
        // No explanation required, proceed immediately with animation
        setTimeout(() => {
          removeCurrentCard();
          setSwipeDirection(null);
          setIsAnimating(false);
        }, 200);
      }
    }
  };

  const removeCurrentCard = () => {
    setIsInfoVisible(false);

    setRemainingCards(prev => {
      const newCards = prev.slice(1);
      if (newCards.length === 0) {
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
    if (isAnimating || remainingCards.length === 0) return;

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
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
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


  const handleAnswerChange = (cardId: string, newAnswer: 'left' | 'right') => {
    setSwipeAnswers(prev => ({
      ...prev,
      [cardId]: newAnswer
    }));
  };

  useEffect(() => {
    if (onChange) {
      onChange({ name: fieldKey, value: swipeAnswers });
    }
  }, [swipeAnswers]);

  if (isFinished) {
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
                        onClick={(e) => { e.preventDefault(); handleAnswerChange(card.id, 'left'); }}
                        aria-label={`Oneens met: ${card.title}`}
                      >
                        <i className="ri-thumb-down-fill"></i>
                        <span>Oneens</span>
                      </button>
                      <button
                        className={`swipe-summary-btn ${answer === 'right' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); handleAnswerChange(card.id, 'right'); }}
                        aria-label={`Eens met: ${card.title}`}
                      >
                        <i className="ri-thumb-up-fill"></i>
                        <span>Eens</span>
                      </button>
                    </div>
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
    <div className="swipe-widget" role="region" aria-label="Swipe widget" tabIndex={0} aria-invalid={!required && Object.keys(swipeAnswers).length === 0 ? 'false' : 'true'}>
      <div className="swipe-container" role="list" aria-label="Stellingen">
        <div className="swipe-stack">
          {remainingCards.slice(0, 3).map((card, index) => {
            const isTop = index === 0;
            const zIndex = remainingCards.length - index;
            let transform = '';
            if (isTop && dragState.isDragging) {
              const rotation = dragState.deltaX * 0.1;
              transform = `translate(${dragState.deltaX}px, ${dragState.deltaY * 0.5}px) rotate(${rotation}deg)`;
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
                  onPointerDown={isTop ? handlePointerDown : undefined}
                  onPointerMove={isTop ? handlePointerMove : undefined}
                  onPointerUp={isTop ? handlePointerUp : undefined}
                  onPointerCancel={isTop ? handlePointerCancel : undefined}
                  onPointerLeave={isTop ? handlePointerLeave : undefined}
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
                    <p className="swipe-card-description" id={`swipe-card-desc-${card.id}`}>{card.title}</p>
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
            onClick={(e) => { handleSwipeLeft(); e.preventDefault(); }}
            disabled={remainingCards.length === 0}
            aria-label="Afwijzen"
            tabIndex={0}
          >
            <i className="ri-thumb-down-fill"></i>
            <span>Oneens</span>
          </button>
          <button
            className="swipe-info-btn"
            onClick={(e) => { setIsInfoVisible(!isInfoVisible); e.preventDefault(); }}
            disabled={!remainingCards[0]?.infoField}
            aria-label="Toon info"
          >
            <span>Info</span>
          </button>
          <button
            className="swipe-btn swipe-btn-like"
            onClick={(e) => { handleSwipeRight(); e.preventDefault(); }}
            disabled={remainingCards.length === 0}
            aria-label="Goedkeuren"
            tabIndex={0}
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
            <textarea placeholder='Toelichting...' rows={5} />
            <Button appearance="primary-action-button" onClick={() => { 
              setIsDialogClosing(true);
              // Start closing animation, then continue with card removal
              setTimeout(() => {
                setShowExplanationDialog(false);
                setIsDialogClosing(false);
                // Continue with the card removal animation after dialog closes
                setTimeout(() => {
                  removeCurrentCard();
                  setSwipeDirection(null);
                  setIsAnimating(false);
                }, 200);
              }, 200); // Wait for closing animation
            }}>Antwoord verzenden</Button>
            <Button appearance="secondary-action-button" onClick={() => { 
              setIsDialogClosing(true);
              // Start closing animation, then continue with card removal
              setTimeout(() => {
                setShowExplanationDialog(false);
                setIsDialogClosing(false);
                // Continue with the card removal animation after dialog closes
                setTimeout(() => {
                  removeCurrentCard();
                  setSwipeDirection(null);
                  setIsAnimating(false);
                }, 200);
              }, 200); // Wait for closing animation
            }}>Sluiten zonder toelichting</Button>
          </div>
        </div>
      )}
    </div >
  );
}
export { SwipeField };
export default SwipeField;
