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
  agreeText?: string;
  disagreeText?: string;
};

type valueObject = Array<{ cardId: string; answer: string; explanation?: string }>;

const SwipeField: FC<SwipeWidgetProps> = ({
  cards = [],
  onSwipeLeft,
  onSwipeRight,
  showButtons = true,
  enableKeyboard = true,
  required = false,
  onChange,
  fieldKey,
  overrideDefaultValue,
  agreeText = 'Eens',
  disagreeText = 'Oneens',
}) => {
  // Track previous answers per card for visual feedback
  const [previousAnswers, setPreviousAnswers] = useState<Record<string, string>>({});
  const swipeCards = useMemo(() => cards.length > 0 ? cards : [], [cards]);
  let initialAnswers: Record<string, string> = {};
  let initialAnswersExplanation: Record<string, string> = {};

  if (overrideDefaultValue && typeof overrideDefaultValue === 'object') {
    const overrideArray = overrideDefaultValue as valueObject;
    overrideArray.forEach(item => {
      initialAnswers[item.cardId as string] = item.answer;
      if (item.explanation) {
        initialAnswersExplanation[item.cardId as string] = item.explanation;
      }
    });
  }

  const [swipeAnswers, setSwipeAnswers] = useState<Record<string, string>>(initialAnswers);
  const [explanations, setExplanations] = useState<Record<string, string>>(initialAnswersExplanation);
  const [isFinished, setIsFinished] = useState(false);

  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'drag' | 'button' | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

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

  const [infoVisibleCardId, setInfoVisibleCardId] = useState<string | null>(null);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  const [pendingSwipe, setPendingSwipe] = useState<{ card: SwipeCard, direction: string } | null>(null);

  const getUnansweredCards = useCallback(() => {
    return swipeCards.filter(card => !swipeAnswers[card.id]);
  }, [swipeCards, swipeAnswers]);

  const moveToPrevious = useCallback(() => {
    const answeredCards = swipeCards.filter(card => swipeAnswers[card.id]);

    if (answeredCards.length === 0) {
      return;
    }

    const lastAnsweredCard = answeredCards[answeredCards.length - 1];
    const lastAnswer = swipeAnswers[lastAnsweredCard.id];

    const newSwipeAnswers = { ...swipeAnswers };
    delete newSwipeAnswers[lastAnsweredCard.id];

    setSwipeAnswers(newSwipeAnswers);

    // Set previous answer for this card
    setPreviousAnswers(prev => ({
      ...prev,
      [lastAnsweredCard.id]: lastAnswer
    }));

    setIsAnimating(false);
    setSwipeDirection(null);
    setAnimationType(null);
    setIsFadingOut(false);
    setPendingSwipe(null);
    setShowExplanationDialog(false);

    setIsFinished(false);
  }, [swipeCards, swipeAnswers, fieldKey]);

  const canGoBack = useCallback(() => {
    const answeredCardIds = Object.keys(swipeAnswers);
    return answeredCardIds.length > 0;
  }, [swipeAnswers]);

  const completeSwipe = useCallback((card: SwipeCard, direction: string) => {
    // First phase: swipe animation (200ms)
    setTimeout(() => {
      setSwipeAnswers(prev => ({
        ...prev,
        [card.id]: direction
      }));
      
      // Start fadeout animation
      setIsFadingOut(true);
      setSwipeDirection(null);
      
      // Second phase: fadeout animation (300ms)
      setTimeout(() => {
        removeCurrentCard();
        setIsAnimating(false);
        setAnimationType(null);
        setIsFadingOut(false);
      }, 300);
    }, 200);
  }, []);

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
        
        // Start fadeout animation
        setIsFadingOut(true);
        setSwipeDirection(null);
        
        // Fadeout animation (300ms)
        setTimeout(() => {
          removeCurrentCard();
          setIsAnimating(false);
          setAnimationType(null);
          setIsFadingOut(false);
        }, 300);
      }, 200);
    }, 200);
  }, [pendingSwipe]);

  useEffect(() => {
    const unanswered = getUnansweredCards();
    setIsFinished(unanswered.length === 0);
  }, [swipeCards, getUnansweredCards]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Restore body scrolling on unmount
      document.body.style.overflow = '';
    };
  }, []);

  const handleSwipeLeft = useCallback((fromButton = false) => {
    const unansweredCards = getUnansweredCards();
    if (unansweredCards.length > 0 && !isAnimating) {
      const currentCard = unansweredCards[0];

      setIsAnimating(true);
      setSwipeDirection(disagreeText);
      setAnimationType(fromButton ? 'button' : 'drag');

      onSwipeLeft?.(currentCard);

      if (currentCard.explanationRequired) {
        setPendingSwipe({ card: currentCard, direction: disagreeText });
        setShowExplanationDialog(true);
      } else {
        completeSwipe(currentCard, disagreeText);
      }
    }
  }, [getUnansweredCards, isAnimating, onSwipeLeft, completeSwipe, disagreeText]);

  const handleSwipeRight = useCallback((fromButton = false) => {
    const unansweredCards = getUnansweredCards();
    if (unansweredCards.length > 0 && !isAnimating) {
      const currentCard = unansweredCards[0];

      setIsAnimating(true);
      setSwipeDirection(agreeText);
      setAnimationType(fromButton ? 'button' : 'drag');

      onSwipeRight?.(currentCard);

      if (currentCard.explanationRequired) {
        setPendingSwipe({ card: currentCard, direction: agreeText });
        setShowExplanationDialog(true);
      } else {
        completeSwipe(currentCard, agreeText);
      }
    }
  }, [getUnansweredCards, isAnimating, onSwipeRight, completeSwipe, agreeText, disagreeText]);

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
  }, [enableKeyboard, handleSwipeLeft, handleSwipeRight]);

  const removeCurrentCard = () => {
    setInfoVisibleCardId(null);

    setTimeout(() => {
      const remainingUnanswered = getUnansweredCards();
      if (remainingUnanswered.length === 0) {
        setIsFinished(true);
      }
    }, 0);
  };

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

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setDragTransform('');
    setSwipeDirection(null);

    // Restore body scrolling
    document.body.style.overflow = '';

    if (element && pointerId !== undefined) {
      try {
        (element as any).releasePointerCapture(pointerId);
      } catch (error) {
      }
    }
  }, []);

  const updateDragTransform = useCallback((deltaX: number, deltaY: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const rotation = deltaX * 0.1;
      const transform = `translate(${deltaX}px, ${deltaY * 0.5}px) rotate(${rotation}deg)`;
      setDragTransform(transform);

      if (Math.abs(deltaX) > 50) {
        setSwipeDirection(deltaX > 0 ? agreeText : disagreeText);
      } else {
        setSwipeDirection(null);
      }
    });
  }, [agreeText, disagreeText]);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    if (isAnimating || getUnansweredCards().length === 0) return;
    
    // Skip touch events when pointer events are from touch (iOS sends both)
    if (event.pointerType === 'touch') return;

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

    // Block body scrolling during drag
    document.body.style.overflow = 'hidden';

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }, [isAnimating, getUnansweredCards]);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging) return;
    
    // Skip touch events when pointer events are from touch
    if (event.pointerType === 'touch') return;

    if (isAnimating) {
      cleanupDragState(event.currentTarget, event.pointerId);
      return;
    }

    const clientX = event.clientX;
    const clientY = event.clientY;
    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;

    dragStateRef.current = {
      ...dragState,
      currentX: clientX,
      currentY: clientY,
      deltaX,
      deltaY,
    };

    updateDragTransform(deltaX, deltaY);

    event.preventDefault();
  }, [isAnimating, cleanupDragState, updateDragTransform]);

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging) return;
    
    // Skip touch events when pointer events are from touch
    if (event.pointerType === 'touch') return;

    const swipeThreshold = 100;
    const velocityThreshold = 0.5;

    const velocity = Math.abs(dragState.deltaX) / 100;
    const deltaX = dragState.deltaX;

    cleanupDragState(event.currentTarget, event.pointerId);

    if (isAnimating) return;

    const shouldSwipe = Math.abs(deltaX) > swipeThreshold || velocity > velocityThreshold;

    if (shouldSwipe) {
      if (deltaX > 0) {
        handleSwipeRight(false);
      } else {
        handleSwipeLeft(false);
      }
    } else {
      setSwipeDirection(null);
    }
  }, [isAnimating, cleanupDragState, handleSwipeRight, handleSwipeLeft]);

  const handlePointerCancel = useCallback((event: React.PointerEvent) => {
    if (event.pointerType === 'touch') return;
    cleanupDragState(event.currentTarget, event.pointerId);
  }, [cleanupDragState]);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    if (event.pointerType === 'touch') return;
    if (dragStateRef.current.isDragging) {
      cleanupDragState(event.currentTarget, event.pointerId);
    }
  }, [cleanupDragState]);

  // Touch event handlers for iOS compatibility
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (isAnimating || getUnansweredCards().length === 0) return;

    const touch = event.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    dragStateRef.current = {
      isDragging: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      deltaX: 0,
      deltaY: 0,
    };

    // Block body scrolling during drag
    document.body.style.overflow = 'hidden';

    event.preventDefault();
    event.stopPropagation();
  }, [isAnimating, getUnansweredCards]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging) return;

    if (isAnimating) {
      cleanupDragState(event.currentTarget);
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;

    const clientX = touch.clientX;
    const clientY = touch.clientY;
    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;

    dragStateRef.current = {
      ...dragState,
      currentX: clientX,
      currentY: clientY,
      deltaX,
      deltaY,
    };

    updateDragTransform(deltaX, deltaY);

    event.preventDefault();
    event.stopPropagation();
  }, [isAnimating, cleanupDragState, updateDragTransform]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState.isDragging) return;

    const swipeThreshold = 100;
    const velocityThreshold = 0.5;

    const velocity = Math.abs(dragState.deltaX) / 100;
    const deltaX = dragState.deltaX;

    cleanupDragState(event.currentTarget);

    if (isAnimating) return;

    const shouldSwipe = Math.abs(deltaX) > swipeThreshold || velocity > velocityThreshold;

    if (shouldSwipe) {
      if (deltaX > 0) {
        handleSwipeRight(false);
      } else {
        handleSwipeLeft(false);
      }
    } else {
      setSwipeDirection(null);
    }

    event.preventDefault();
    event.stopPropagation();
  }, [isAnimating, cleanupDragState, handleSwipeRight, handleSwipeLeft]);

  const handleTouchCancel = useCallback((event: React.TouchEvent) => {
    cleanupDragState(event.currentTarget);
  }, [cleanupDragState]);


  const handleAnswerChange = (cardId: string, newAnswer: string) => {
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

  const goBackToSwipe = useCallback(() => {
    const answeredCards = swipeCards.filter(card => swipeAnswers[card.id]);

    if (answeredCards.length > 0) {
      // Ga terug naar de laatste beantwoorde kaart en maak het onbeantwoord
      const lastAnsweredCard = answeredCards[answeredCards.length - 1];
      const lastAnswer = swipeAnswers[lastAnsweredCard.id];
      const newSwipeAnswers = { ...swipeAnswers };
      delete newSwipeAnswers[lastAnsweredCard.id];

      setSwipeAnswers(newSwipeAnswers);

      // Zet previous answer voor deze kaart
      setPreviousAnswers(prev => ({
        ...prev,
        [lastAnsweredCard.id]: lastAnswer
      }));
    }

    setIsFinished(false);
    setIsAnimating(false);
    setSwipeDirection(null);
    setAnimationType(null);
    setIsFadingOut(false);
    setPendingSwipe(null);
    setShowExplanationDialog(false);
  }, [swipeCards, swipeAnswers, fieldKey]);

  useEffect(() => {
    if (onChange) {
      const combinedAnswers: valueObject = swipeCards.map(card => ({
        cardId: card.id,
        answer: swipeAnswers[card.id],
        title: card.title || '',
        explanation: explanations[card.id] || '',
      })).filter(item => item.answer !== undefined);

      onChange({ name: fieldKey, value: combinedAnswers });
    }
  }, [swipeAnswers, explanations]);

  const unansweredCards = getUnansweredCards();

  const currentIndex = swipeCards.length - unansweredCards.length;

  if (isFinished || unansweredCards.length === 0) {
    return (
      <>
        <button
          className="swipe-back-button"
          onClick={(e) => (e.preventDefault(), goBackToSwipe())}
          type="button"
          aria-label="Ga terug naar swipe"
        >
          Terug
        </button>
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
                            className={`swipe-summary-btn ${answer === disagreeText ? 'active' : ''}`}
                            onClick={(e) => (e.preventDefault(), handleAnswerChange(card.id, disagreeText))}
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
      </>
    );
  }

  const currentCardId = unansweredCards[0]?.id || '';

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
              const positionClass = `swipe-card--position-${index}`;
              let transform = '';

              if (isTop && dragStateRef.current.isDragging && !isFadingOut) {
                // During active drag, use the drag transform
                transform = dragTransform;
              }
              // For all animations (drag release and button clicks), we rely on CSS classes
              return (
                <>
                  <div
                    key={card.id}
                    className={`swipe-card ${positionClass} ${isTop ? 'swipe-card--top' : ''} ${swipeDirection && isTop ? `swipe-card--${swipeDirection === agreeText ? 'right' : 'left'}` : ''} ${isAnimating && isTop ? 'swipe-card--animating' : ''} ${animationType && isTop ? `swipe-card--${animationType}` : ''} ${isFadingOut && isTop ? 'swipe-card--fadeout' : ''}`}
                    style={{ zIndex, ...(transform ? { transform } : {}) }}
                    {...(isTop
                      ? {
                        onPointerDown: handlePointerDown,
                        onPointerMove: handlePointerMove,
                        onPointerUp: handlePointerUp,
                        onPointerCancel: handlePointerCancel,
                        onPointerLeave: handlePointerLeave,
                        onTouchStart: handleTouchStart,
                        onTouchMove: handleTouchMove,
                        onTouchEnd: handleTouchEnd,
                        onTouchCancel: handleTouchCancel
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
                      <div className={`swipe-indicator swipe-indicator--${swipeDirection === agreeText ? 'right' : 'left'}`} aria-live="polite" aria-label={swipeDirection === disagreeText ? 'Afwijzen' : 'Goedkeuren'}>
                        {swipeDirection === disagreeText ? (
                          <i className="ri-thumb-down-fill"></i>

                        ) : (
                          <i className="ri-thumb-up-fill"></i>
                        )}
                      </div>
                    )}
                  </div>
                  {card.infoField && (
                    <div
                      className="info-card"
                      aria-hidden={infoVisibleCardId !== card.id ? 'true' : 'false'}
                      onClick={() => { setInfoVisibleCardId(null); }}
                    >
                      <div className="info-card-container" onClick={e => e.stopPropagation()}>
                        <Paragraph>
                          {card.infoField}
                        </Paragraph>
                        <Button appearance="primary-action-button" onClick={() => { setInfoVisibleCardId(null); }}>Snap ik</Button>
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
              className={`swipe-btn swipe-btn-pass${
                previousAnswers[currentCardId] === disagreeText
                  ? ' --previous-awnser'
                  : ''
              }`}
              onClick={(e) => (e.preventDefault(), handleSwipeLeft(true))}
              disabled={unansweredCards.length === 0}
              aria-label="Afwijzen"
            >
              <i className="ri-thumb-down-fill"></i>
              <span>Oneens</span>
            </button>
            <button
              className="swipe-info-btn"
              onClick={(e) => {
                e.preventDefault();
                setInfoVisibleCardId(infoVisibleCardId === currentCardId ? null : currentCardId);
              }}
              disabled={!unansweredCards[0]?.infoField}
              aria-label="Toon info"
            >
              <span>Info</span>
            </button>
            <button
              className={`swipe-btn swipe-btn-like${
                previousAnswers[currentCardId] === agreeText
                  ? ' --previous-awnser'
                  : ''
              }`}
              onClick={(e) => (e.preventDefault(), handleSwipeRight(true))}
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
              <textarea
                autoFocus
                placeholder='Toelichting...'
                rows={5}
                value={explanations[currentCardId] || ''}
                onChange={(e) => handleExplanationChange(String(currentCardId), e.target.value)}
              />
              <Button appearance="primary-action-button" onClick={closeExplanationDialog}>
                Antwoord verzenden
              </Button>
              <Button appearance="secondary-action-button" onClick={closeExplanationDialog}>
                Overslaan
              </Button>
            </div>
          </div>
        )}
      </div >
      <button
        className="swipe-back-button"
        onClick={(e) => (e.preventDefault(), moveToPrevious())}
        disabled={!canGoBack()}
        type="button"
        aria-label="Ga terug naar vorige kaart"
      >
        Terug
      </button>
    </>
  );
}
export { SwipeField };
export default SwipeField;
