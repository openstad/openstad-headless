import './swipe.css';
import 'swiper/css';
import 'swiper/css/effect-cards';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import type { BaseProps } from '@openstad-headless/types';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

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
    title: 'Sportmogelijkheden',
    description: 'Iedere wijk in Den Haag moet evenveel sportmogelijkheden hebben.',
    image: 'https://picsum.photos/seed/17528196455426/400/600'
  },
  {
    id: '3',
    title: 'Sportmogelijkheden',
    description: 'Iedere wijk in Den Haag moet evenveel sportmogelijkheden hebben.',
    image: 'https://picsum.photos/seed/17528139645426/400/600'
  },
  {
    id: '4',
    title: 'Sportmogelijkheden',
    description: 'Iedere wijk in Den Haag moet evenveel sportmogelijkheden hebben.',
    image: 'https://picsum.photos/seed/17528119645426/400/600'
  },
  {
    id: '5',
    title: 'Sportmogelijkheden',
    description: 'Iedere wijk in Den Haag moet evenveel sportmogelijkheden hebben.',
    image: 'https://picsum.photos/seed/175281679645426/400/600'
  },
];

function Swipe({
  cards = [],
  onSwipeLeft,
  onSwipeRight,
  showButtons = true,
  enableKeyboard = true,
  ...props
}: SwipeWidgetProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [remainingCards, setRemainingCards] = useState<SwipeCard[]>([]);

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

  const handleSwipeLeft = () => {
    if (remainingCards.length > 0 && currentCardIndex < remainingCards.length) {
      const currentCard = remainingCards[currentCardIndex];
      onSwipeLeft?.(currentCard);

      // Remove the current active card from the array
      setRemainingCards(prev => prev.filter((_, index) => index !== currentCardIndex));

      // Adjust currentCardIndex if necessary
      if (currentCardIndex >= remainingCards.length - 1) {
        setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
      }

      // Check if this was the last card
      if (remainingCards.length === 1) {
        setIsFinished(true);
      }
    }
  };

  const handleSwipeRight = () => {
    if (remainingCards.length > 0 && currentCardIndex < remainingCards.length) {
      const currentCard = remainingCards[currentCardIndex];
      onSwipeRight?.(currentCard);

      // Remove the current active card from the array
      setRemainingCards(prev => prev.filter((_, index) => index !== currentCardIndex));

      // Adjust currentCardIndex if necessary
      if (currentCardIndex >= remainingCards.length - 1) {
        setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
      }

      // Check if this was the last card
      if (remainingCards.length === 1) {
        setIsFinished(true);
      }
    }
  };


  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentCardIndex(swiper.activeIndex);
  };


  const resetCards = () => {
    setRemainingCards(swipeCards);
    setCurrentCardIndex(0);
    setIsFinished(false);
    swiperRef.current?.slideTo(0);
  };

  if (isFinished) {
    return (
      <div className="swipe-widget swipe-finished">
        <div className="swipe-finished-content">
          <h2>No more cards!</h2>
          <p>You've seen all available cards.</p>
          <button onClick={resetCards} className="swipe-reset-btn">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-widget">
      <div className="swipe-counter">
        Stelling {(currentCardIndex % remainingCards.length) + 1} van de {remainingCards.length}
      </div>

      <div className="swipe-container">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          effect="cards"
          grabCursor={true}
          modules={[EffectCards, Keyboard]}
          onSlideChange={handleSlideChange}
          keyboard={{
            enabled: enableKeyboard,
          }}
          cardsEffect={{
            slideShadows: true,
          }}
          className="swipe-swiper"
        >
          {remainingCards.map((card) => (
            <SwiperSlide key={card.id} className="swipe-slide">
              <div className="swipe-card">
                {card.image && (
                  <div className="swipe-card-image">
                    <img src={card.image} alt={card.title} />
                  </div>
                )}
                <div className="swipe-card-content">
                  <p className="swipe-card-description">{card.description}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
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
