import './videoSlider.css';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import type { BaseProps } from '@openstad-headless/types';
import { Pagination, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import SwipeField from '@openstad-headless/swipe/src/swipe';

export type VideoSliderWidgetProps = BaseProps &
  VideoSliderProps & {
    resourceId?: string;
    resourceIdRelativePath?: string;
    items?: any;
  };

export type VideoSliderProps = {
  baseSlides?: any;
  items?: any;
};

const defaultSlides = [
  {
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    type: 'intro',
    content: 'Mijn naam is Jasmijn en doe een project over sporten in Den Haag. Hoe maken we dit toegankelijker voor jongeren? Jouw mening telt, dus scroll naar beneden en beantwoord de vragen: hoe jij meer zou gaan sporten?',
  },
  {
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    type: 'checkbox',
    content: 'Wat zou je helpen om meer te sporten?',
    question: [
      {
        title: 'Flexibelere tijden',
        id: 'flexible_times',
      },
      {
        title: 'Lagere kosten',
        id: 'lower_costs',
      },
      {
        title: 'Samen met anderen',
        id: 'together_with_others',
      },
      {
        title: 'Dichter bij huis',
        id: 'closer_to_home',
      }

    ]
  },
  {
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    type: 'radiofield',
    content: 'Dilemma',
    question: [
      {
        title: 'Altijd gratis sportles in jouw wijk',
        id: 'free_sport_lesson',
      },
      {
        title: '10 nieuwe sportplekken in jouw wijk',
        id: 'new_sport_locations',
      }
    ]
  }
]

function Swipe({ slide, active, muted }: { slide: any, active: boolean, muted: boolean }) {
  const [isActive, setActive] = useState(active);


  console.log('slide:', slide);

  useEffect(() => {
    setActive(active);
  }, [active]);

  return (
    <div className="swiper-video-container">
      {isActive && (
        <div className="swiper-video-content">
          <div className="swiper-video-question">
            {slide.questionType === 'none' && (
              <div className="--intro">
                {slide.description}
              </div>
            )}
            {slide.questionType === 'multiple' && (
              <>
                <div className="--intro">
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                </div>
                <ul className="swiper-video-question-list">
                  {slide.options?.map((q, key) => (
                    <li key={q.id}>
                      <input type="checkbox" id={q.titles[0].key} />
                      <label htmlFor={q.titles[0].key}>
                        <span>{String.fromCharCode(97 + key).toUpperCase()}</span> {q.titles[0].key}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {slide.questionType === 'multiplechoice' && (
              <>
                <div className="--intro">
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                </div>
                <ul className="swiper-video-question-list --radiofield">
                  {slide.options?.map((q, key) => (
                    <li key={q.id}>
                      <input type="radio" id={q.titles[0].key} name={'radio'} />
                      <label htmlFor={q.titles[0].key}>
                        <span>{String.fromCharCode(97 + key).toUpperCase()}</span> {q.titles[0].key}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {slide.questionType === 'swipe' && (() => {
              const swipeSlides = slide?.options?.map((card: any) => ({
                id: card.trigger,
                description: card.titles[0].key,
                image: card.titles[0].image || '',
              }));
              return (
                <>
                  <div className="--intro">
                    <h2>{slide.title}</h2>
                    <p>{slide.description}</p>
                  </div>
                  <ul className="swiper-video-question-list">
                    <li>
                      <SwipeField
                        cards={swipeSlides}
                      />
                    </li>
                  </ul>
                </>
              );
            })()}
          </div>
          <video
            src={slide.src || 'https://www.w3schools.com/html/mov_bbb.mp4'}
            autoPlay={isActive}
            muted={muted}
            loop={true}
          />
        </div>
      )}
      {!isActive && (
        <div className="swiper-video-content">
          <video
            src={slide.src || 'https://www.w3schools.com/html/mov_bbb.mp4'}
            autoPlay={false}
            muted={true}
            loop={true}
          />
        </div>
      )}
    </div>
  )
}


function VideoSlider({
  baseSlides = defaultSlides,
  ...props
}: VideoSliderWidgetProps) {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slides = props?.items || baseSlides;

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleSwiperClick = (swiper: any, event: Event) => {
    if (muted) {
      const target = event.target as HTMLElement;
      if (target.closest('input') || target.closest('label')) {
        return;
      }
      setMuted(false);
    }
  };

  console.log('sliderprops:', props)


  return (
    <div className="video-slider">
      <form className="video-slider-form" onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log(Object.fromEntries(formData.entries()))
      }}>
        <Swiper
          modules={[A11y]}
          direction='vertical'
          pagination={{ clickable: false }}
          onSwiper={(swiper) => console.log(swiper)}
          onSlideChange={(e) => setCurrent(e.activeIndex)}
          onClick={handleSwiperClick}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <Swipe slide={slide} active={index === current} muted={muted} />
            </SwiperSlide>
          ))}
          <SwiperSlide key={99999}>
            <div className="final-slide">
              <h2>Dat waren alle vragen!</h2>
              <p>Bedankt voor het beantwoorden van de vragen.</p>
              <button type="submit">Versturen</button>
            </div>
          </SwiperSlide>
        </Swiper>

        <div className="video-slider-controls">
          <button onClick={() => setMuted(!muted)} className={`video-slider-mute-button ${muted ? '--muted' : ''}`}>
            <span>{muted ? 'Unmute' : 'Mute'}</span>
          </button>
          <button
            onClick={async () => {
              try {
                if (document.fullscreenElement) {
                  await document.exitFullscreen();
                  setMuted(true);
                } else {
                  await document.documentElement.requestFullscreen();
                  setMuted(false);
                }
              } catch (error) {
                console.error('Error toggling fullscreen:', error);
              }
            }}
            className={`video-slider-fullscreen-button${isFullscreen ? ' --fullscreen' : ''}`}
          >
            <span>{isFullscreen ? 'venster verlaten' : 'volledig scherm'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}


VideoSlider.loadWidget = loadWidget;

export { VideoSlider };
