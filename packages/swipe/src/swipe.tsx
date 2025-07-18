import './swipe.css';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import type { BaseProps } from '@openstad-headless/types';

export type SwipeCard = {
  id: string;
  title: string;
  description: string;
  image?: string;
  age?: number;
  location?: string;
};

export type SwipeWidgetProps = BaseProps &
  SwipeProps & {
    resourceId?: string;
    resourceIdRelativePath?: string;
  };

export type SwipeProps = {
  cards?: SwipeCard[];
  onSwipeLeft?: (card: SwipeCard) => void;
  onSwipeRight?: (card: SwipeCard) => void;
  showButtons?: boolean;
  enableKeyboard?: boolean;
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

function Swipe({
  cards = [],
  onSwipeLeft = () => { console.log('Swiped LEFT'); },
  onSwipeRight = () => { console.log('Swiped RIGHT'); },
  showButtons = true,
  enableKeyboard = true,
  ...props
}: SwipeWidgetProps) {
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

  // Use useMemo to stabilize the swipeCards reference
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
      const currentCard = remainingCards[0]; // Always take the top card
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
      const currentCard = remainingCards[0]; // Always take the top card
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
      const newCards = prev.slice(1); // Remove the first card
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

    // Calculate velocity (rough approximation)
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
      <div className="swipe-widget swipe-finished">
        <div className="swipe-finished-content">
          <h2>Klaar!</h2>
          <p>Je hebt alle beschikbare kaarten gezien.</p>
          <button onClick={resetCards} className="swipe-reset-btn">
            Begin opnieuw
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-widget">
      <div className="swipe-intro">
        <div className="swipe-progress">
          <progress id="file" value={100 - (remainingCards.length / defaultCards.length) * 100} max="100"> {100 - (remainingCards.length / defaultCards.length) * 100} </progress>
        </div>
        <div className="swipe-counter">
          Stelling {defaultCards.length - remainingCards.length + 1} van de {defaultCards.length}
        </div>

      </div>
      <div className="swipe-container">
        <div className="swipe-stack">
          {remainingCards.slice(0, 3).map((card, index) => {
            const isTop = index === 0;
            const zIndex = remainingCards.length - index;

            // Calculate transform for dragging
            let transform = '';
            if (isTop && dragState.isDragging) {
              const rotation = dragState.deltaX * 0.1; // Rotation based on horizontal movement
              transform = `translate(${dragState.deltaX}px, ${dragState.deltaY * 0.5}px) rotate(${rotation}deg)`;
            } else if (isTop && swipeDirection && isAnimating) {
              const direction = swipeDirection === 'right' ? 1 : -1;
              transform = `translateX(${direction * 150}px) rotate(${direction * 30}deg)`;
            }

            return (
              <div
                key={card.id}
                className={`swipe-card ${isTop ? 'swipe-card--top' : ''} ${swipeDirection && isTop ? `swipe-card--${swipeDirection}` : ''
                  } ${isAnimating && isTop ? 'swipe-card--animating' : ''}`}
                style={{
                  zIndex,
                  transform,
                }}
                onPointerDown={isTop ? handlePointerDown : undefined}
                onPointerMove={isTop ? handlePointerMove : undefined}
                onPointerUp={isTop ? handlePointerUp : undefined}
              >
                {card.image && (
                  <div className="swipe-card-image">
                    <img src={card.image} alt={card.title} />
                  </div>
                )}
                <div className="swipe-card-content">
                  <p className="swipe-card-description">{card.description}</p>
                </div>

                {/* Swipe direction indicators */}
                {isTop && swipeDirection && (
                  <div className={`swipe-indicator swipe-indicator--${swipeDirection}`}>
                    {swipeDirection === 'left' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
        <div className="swipe-actions">
          <button
            className="swipe-btn swipe-btn-pass"
            onClick={handleSwipeLeft}
            disabled={remainingCards.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <button
            className="swipe-btn swipe-btn-like"
            onClick={handleSwipeRight}
            disabled={remainingCards.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

Swipe.loadWidget = loadWidget;

export { Swipe };
