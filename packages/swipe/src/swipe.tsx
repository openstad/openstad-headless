import './swipe.css';
import React, { useState, useEffect, useMemo, FC } from 'react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import type { BaseProps } from '@openstad-headless/types';

export type SwipeCard = {
  id: string;
  title: string;
  description: string;
  image?: string;

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
  fieldKey?: string;
  type?: string;
};

// Default demo cards - moved outside component to prevent recreation
const defaultCards: SwipeCard[] = [
  {
    id: '1',
    title: 'Sportmogelijkheden',
    description: 'Iedere wijk in Den Haag moet evenveel sportmogelijkheden hebben.',
    image: 'https://picsum.photos/seed/1752819645426/400/600'
  },
  {
    id: '2',
    title: 'Lorem Ipsum',
    description: 'Lorem ipsum dolor sit amet, consecdidunt ut labore et dolore magna aliqua.',
    image: 'https://picsum.photos/seed/17528196455426/400/600'
  },
  {
    id: '3',
    title: 'est et esse consequat',
    description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: 'https://picsum.photos/seed/17528139645426/400/600'
  },
  {
    id: '4',
    title: 'Sportmogelijkheden',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
    image: 'https://picsum.photos/seed/17528119645426/400/600'
  },
  {
    id: '5',
    title: 'Sportmogelijkheden',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: 'https://picsum.photos/seed/175281679645426/400/600'
  },
];

const SwipeField: FC<SwipeWidgetProps> = ({
  cards = defaultCards,
  onSwipeLeft = () => { console.log('Swiped LEFT'); },
  onSwipeRight = () => { console.log('Swiped RIGHT'); },
  showButtons = true,
  enableKeyboard = true,
  ...props
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [remainingCards, setRemainingCards] = useState<SwipeCard[]>([]);
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

  const swipeCards = useMemo(() => {
    return cards.length > 0 ? cards : defaultCards;
  }, [cards]);

  // Initialize remaining cards when cards prop changes
  useEffect(() => {
    setRemainingCards(swipeCards);
    setCurrentCardIndex(0);
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
  }, [enableKeyboard, remainingCards.length, isAnimating]);

  const handleSwipeLeft = () => {
    if (remainingCards.length > 0 && !isAnimating) {
      setIsAnimating(true);
      setSwipeDirection('left');
      const currentCard = remainingCards[0];
      onSwipeLeft?.(currentCard);

      setTimeout(() => {
        removeCurrentCard();
        setSwipeDirection(null);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSwipeRight = () => {
    if (remainingCards.length > 0 && !isAnimating) {
      setIsAnimating(true);
      setSwipeDirection('right');
      const currentCard = remainingCards[0];
      onSwipeRight?.(currentCard);

      setTimeout(() => {
        removeCurrentCard();
        setSwipeDirection(null);
        setIsAnimating(false);
      }, 300);
    }
  };

  const removeCurrentCard = () => {
    setRemainingCards(prev => {
      const newCards = prev.slice(1);
      if (newCards.length === 0) {
        setIsFinished(true);
      }
      return newCards;
    });
  };

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
    if (!dragState.isDragging || isAnimating) return;

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
    if (!dragState.isDragging || isAnimating) return;

    const swipeThreshold = 100;
    const velocityThreshold = 0.5;

    const velocity = Math.abs(dragState.deltaX) / 100;

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

    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
    });

    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const resetCards = () => {
    setRemainingCards(swipeCards);
    setCurrentCardIndex(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="swipe-widget swipe-finished" role="region" aria-live="polite" tabIndex={0}>
        <div className="swipe-finished-content">
          <h2>Klaar!</h2>
          <p>Je hebt alle stellingen gehad.</p>
          <button onClick={(e) => { resetCards(); e.preventDefault(); }} className="swipe-reset-btn" aria-label="Begin opnieuw">
            Begin opnieuw
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-widget" role="region" aria-label="Swipe widget" tabIndex={0}>
      <div className="swipe-intro" role="group" aria-label="Voortgang">
        <div className="swipe-progress">
          <label htmlFor="swipe-progress-bar" className="sr-only">Voortgang</label>
          <progress id="swipe-progress-bar" value={100 - (remainingCards.length / cards.length) * 100} max="100" aria-valuenow={100 - (remainingCards.length / cards.length) * 100} aria-valuemax={100} aria-label="Voortgang"></progress>
        </div>
        <div className="swipe-counter" aria-live="polite" tabIndex={0}>
          Stelling {cards.length - remainingCards.length + 1} van de {cards.length}
        </div>
      </div>
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
              transform = `translateX(${direction * 150}px) rotate(${direction * 30}deg)`;
            }
            return (
              <div
                key={card.id}
                className={`swipe-card ${isTop ? 'swipe-card--top' : ''} ${swipeDirection && isTop ? `swipe-card--${swipeDirection}` : ''} ${isAnimating && isTop ? 'swipe-card--animating' : ''}`}
                style={{ zIndex, transform }}
                onPointerDown={isTop ? handlePointerDown : undefined}
                onPointerMove={isTop ? handlePointerMove : undefined}
                onPointerUp={isTop ? handlePointerUp : undefined}
                role="listitem"
                aria-label={card.title}
                tabIndex={isTop ? 0 : -1}
                aria-describedby={`swipe-card-desc-${card.id}`}
              >
                {card.image && (
                  <div className="swipe-card-image">
                    <img src={card.image} alt={card.title || `afbeelding voor: ${card.description}`} />
                  </div>
                )}
                <div className="swipe-card-content">
                  <p className="swipe-card-description" id={`swipe-card-desc-${card.id}`}>{card.description}</p>
                </div>
                {isTop && swipeDirection && (
                  <div className={`swipe-indicator swipe-indicator--${swipeDirection}`} aria-live="polite" aria-label={swipeDirection === 'left' ? 'Afwijzen' : 'Goedkeuren'}>
                    {swipeDirection === 'left' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" role="img" aria-label="Afwijzen icoon" focusable="false">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" role="img" aria-label="Goedkeuren icoon" focusable="false">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" role="img" aria-label="Afwijzen icoon" focusable="false">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <button
            className="swipe-btn swipe-btn-like"
            onClick={(e) => { handleSwipeRight(); e.preventDefault(); }}
            disabled={remainingCards.length === 0}
            aria-label="Goedkeuren"
            tabIndex={0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" role="img" aria-label="Goedkeuren icoon" focusable="false">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
export { SwipeField };
export default SwipeField;
