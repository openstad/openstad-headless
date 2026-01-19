import './swipe.scss';
import React, { useState, useEffect, useMemo, FC, useCallback, useRef, useId } from 'react';
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
  // Generate unique ID for this component instance
  const componentId = useId();
  
  // Track previous answers per card for visual feedback
  const [previousAnswers, setPreviousAnswers] = useState<Record<string, string>>({});
  const swipeCards = useMemo(() => cards.length > 0 ? cards : [], [cards]);
  
  // Track the card IDs this component is responsible for
  const componentCardIds = useMemo(() => {
    return new Set(swipeCards.map(card => card.id));
  }, [swipeCards]);
  
  // Helper function to validate if overrideDefaultValue belongs to this swipe component
  const validateOverrideData = useCallback((override: FormValue | undefined): boolean => {
    if (!override || typeof override !== 'object' || !Array.isArray(override)) {
      return false;
    }
    
    const overrideArray = override as valueObject;
    if (overrideArray.length === 0) {
      return false;
    }
    
    // Check if at least one cardId in the override data exists in current swipeCards
    // This allows for valid data even if the override contains answers for already-answered cards
    return overrideArray.some(item => componentCardIds.has(item.cardId));
  }, [componentCardIds]);
  
  // Initialize answers from overrideDefaultValue only if it's valid for this component
  const getInitialAnswers = useCallback(() => {
    let initialAnswers: Record<string, string> = {};
    let initialAnswersExplanation: Record<string, string> = {};

    if (validateOverrideData(overrideDefaultValue)) {
      const overrideArray = overrideDefaultValue as valueObject;
      overrideArray.forEach(item => {
        // Only include answers for cards that belong to this component
        if (componentCardIds.has(item.cardId)) {
          initialAnswers[item.cardId as string] = item.answer;
          if (item.explanation) {
            initialAnswersExplanation[item.cardId as string] = item.explanation;
          }
        }
      });
    }
    
    return { initialAnswers, initialAnswersExplanation };
  }, [overrideDefaultValue, validateOverrideData, componentCardIds]);

  const [swipeAnswers, setSwipeAnswers] = useState<Record<string, string>>(() => getInitialAnswers().initialAnswers);
  const [explanations, setExplanations] = useState<Record<string, string>>(() => getInitialAnswers().initialAnswersExplanation);
  
  // Track if we've already initialized from overrideDefaultValue to prevent loops
  const hasInitialized = useRef(false);
  // Track the cards this component was initialized with
  const initializedCardIds = useRef<Set<string>>(componentCardIds);
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

  const moveToNext = useCallback(() => {
    const unansweredCards = getUnansweredCards();
    if (unansweredCards.length > 0) {
      // Markeer de huidige kaart als 'skipped'
      const currentCard = unansweredCards[0];
      setSwipeAnswers(prev => ({
        ...prev,
        [currentCard.id]: 'skipped'
      }));
      setIsAnimating(false);
      setSwipeDirection(null);
      setAnimationType(null);
      setIsFadingOut(false);
      setPendingSwipe(null);
      setShowExplanationDialog(false);
    }
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

  // Detect when cards change (new swipe component with different cards)
  useEffect(() => {
    // Check if the cards have changed compared to what we initialized with
    const currentCardIdsString = Array.from(componentCardIds).sort().join(',');
    const initialCardIdsString = Array.from(initializedCardIds.current).sort().join(',');
    
    if (currentCardIdsString !== initialCardIdsString) {
      // Cards have changed - this is a different swipe component
      // Reset all state and reinitialize with new data
      const { initialAnswers, initialAnswersExplanation } = getInitialAnswers();
      setSwipeAnswers(initialAnswers);
      setExplanations(initialAnswersExplanation);
      setIsFinished(false);
      setPreviousAnswers({});
      
      // Update the ref to track these new cards
      initializedCardIds.current = componentCardIds;
      hasInitialized.current = false; // Allow reinitialization
    }
  }, [componentCardIds, getInitialAnswers]);

  // Reset state when overrideDefaultValue changes to data that doesn't belong to this component
  useEffect(() => {
    // Skip if we haven't initialized yet or if the component just mounted
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }
    
    // Only act if overrideDefaultValue has data that doesn't match our cards
    if (overrideDefaultValue && Array.isArray(overrideDefaultValue) && overrideDefaultValue.length > 0) {
      const overrideArray = overrideDefaultValue as valueObject;
      
      // Check if ANY of the cardIds in override belong to another component
      const hasOtherComponentData = overrideArray.some(item => !componentCardIds.has(item.cardId));
      const hasOwnComponentData = overrideArray.some(item => componentCardIds.has(item.cardId));
      
      // Only reset if ALL data is for another component (none is for us)
      if (hasOtherComponentData && !hasOwnComponentData) {
        setSwipeAnswers({});
        setExplanations({});
        setIsFinished(false);
        setPreviousAnswers({});
      }
    }
  }, [overrideDefaultValue, componentCardIds]);

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
            <Heading level={2}>Gemaakte keuzes</Heading>
            <Paragraph>Bekijk en wijzig waar nodig de antwoorden.</Paragraph>


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
                        placeholder="Voeg een korte uitleg (niet verplicht) toe..."
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
            <div className="swipe-main-actions">
              <button
                className={`swipe-btn swipe-btn-pass${previousAnswers[currentCardId] === disagreeText
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
                className={`swipe-btn swipe-btn-like${previousAnswers[currentCardId] === agreeText
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

            <div className="swipe-middle-actions">
              {/* <button className="swipe-skip-btn" onClick={(e) => (e.preventDefault(), moveToPrevious())} aria-label="Terug naar vorige kaart" disabled={!canGoBack()}>
                <span className="sr-only">Terug naar vorige kaart</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M267.1 128.6C270 129.9 272 132.8 272 136L272 504C272 507.2 270.1 510.1 267.1 511.4C264.1 512.7 260.7 512 258.4 509.8L66.4 325.8C64.8 324.3 63.9 322.2 63.9 320C63.9 317.8 64.8 315.7 66.4 314.2L258.4 130.2C260.7 128 264.1 127.4 267.1 128.6zM279.7 99.2C265 92.9 247.9 96 236.3 107.1L44.3 291.1C36.5 298.7 32 309.1 32 320C32 330.9 36.5 341.3 44.3 348.9L236.3 532.9C247.9 544 264.9 547.1 279.7 540.8C294.5 534.5 304 520 304 504L304 367.7L476.3 532.8C487.9 543.9 504.9 547 519.7 540.7C534.5 534.4 544 520 544 504L544 136C544 120 534.4 105.5 519.7 99.2C505 92.9 487.9 96 476.3 107.1L304 272.3L304 136C304 120 294.4 105.5 279.7 99.2zM304 320C304 317.8 304.9 315.7 306.5 314.2L498.5 130.2C500.8 128 504.2 127.4 507.2 128.6C510.2 129.8 512 132.8 512 136L512 504C512 507.2 510.1 510.1 507.1 511.4C504.1 512.7 500.7 512 498.4 509.8L306.4 325.8C304.8 324.3 303.9 322.2 303.9 320z" />
                </svg>
              </button> */}
              <button
                className="swipe-info-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setInfoVisibleCardId(infoVisibleCardId === currentCardId ? null : currentCardId);
                }}
                disabled={!unansweredCards[0]?.infoField}
                aria-label="Toon info"
              >
                <span className="sr-only">Toon info</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM280 400C266.7 400 256 410.7 256 424C256 437.3 266.7 448 280 448L360 448C373.3 448 384 437.3 384 424C384 410.7 373.3 400 360 400L352 400L352 312C352 298.7 341.3 288 328 288L280 288C266.7 288 256 298.7 256 312C256 325.3 266.7 336 280 336L304 336L304 400L280 400zM320 256C337.7 256 352 241.7 352 224C352 206.3 337.7 192 320 192C302.3 192 288 206.3 288 224C288 241.7 302.3 256 320 256z" />
                </svg>
              </button>
              <button className="swipe-skip-btn" onClick={(e) => (e.preventDefault(), moveToNext())} aria-label="Kaart overslaan">
                <span>Overslaan</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M141.5 130.2C139.2 128 135.8 127.4 132.8 128.6C129.8 129.8 128 132.8 128 136L128 504C128 507.2 129.9 510.1 132.9 511.4C135.9 512.7 139.3 512 141.6 509.8L333.6 325.8C335.2 324.3 336.1 322.2 336.1 320C336.1 317.8 335.2 315.7 333.6 314.2L141.6 130.2zM336 367.7L163.7 532.9C152.1 544 135.1 547.1 120.3 540.8C105.5 534.5 96 520 96 504L96 136C96 120 105.6 105.5 120.3 99.2C135 92.9 152.1 96 163.7 107.1L336 272.3L336 136C336 120 345.6 105.5 360.3 99.2C375 92.9 392.1 96 403.7 107.1L595.7 291.1C603.6 298.6 608 309.1 608 320C608 330.9 603.5 341.3 595.7 348.9L403.7 532.9C392.1 544 375.1 547.1 360.3 540.8C345.5 534.5 336 520 336 504L336 367.7zM372.9 128.6C370 129.9 368 132.8 368 136L368 504C368 507.2 369.9 510.1 372.9 511.4C375.9 512.7 379.3 512 381.6 509.8L573.6 325.8C575.2 324.3 576.1 322.2 576.1 320C576.1 317.8 575.2 315.7 573.6 314.2L381.6 130.2C379.3 128 375.9 127.4 372.9 128.6z" />
                </svg>
              </button>
            </div>
          </div>
        )}



        {showExplanationDialog && (
          <div className={`explanation-dialog ${isDialogClosing ? 'explanation-dialog--closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="explanation-dialog-title">
            <div className="explanation-dialog-content">
              <Heading level={3} id="explanation-dialog-title">Korte uitleg</Heading>
              <Paragraph>Zodat we beter begrijpen wat belangrijk is.</Paragraph>
              <textarea
                autoFocus
                placeholder='Ik maak deze keuze, omdat...'
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
