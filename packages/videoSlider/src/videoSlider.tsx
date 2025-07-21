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

export type VideoSliderWidgetProps = BaseProps &
  VideoSliderProps & {
    resourceId?: string;
    resourceIdRelativePath?: string;
  };

export type VideoSliderProps = {
};

const defaultSlides = [
  {
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    type: 'intro',
    content: 'Mijn naam is Jasmijn en doe een project over sporten in Den Haag. Hoe maken we dit toegankelijker voor jongeren? Jouw mening telt, dus scroll naar beneden en beantwoord de vragen: hoe jij meer zou gaan sporten?',
  },
  {
    src: './public/SampleVideo_1280x720_1mb.mp4',
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

function Swipe({ slide, active, muted }: { slide: typeof defaultSlides[number], active: boolean, muted: boolean }) {
  const [isActive, setActive] = useState(active);

  useEffect(() => {
    setActive(active);
  }, [active]);


  return (
    <div className="swiper-video-container">
      {isActive && (
        <div className="swiper-video-content">
          <div className="swiper-video-question">
            {slide.type === 'intro' && (
              <div className="--intro">
                {slide.content}
              </div>
            )}
            {slide.type === 'checkbox' && (
              <>
                <div className="--intro">
                  <h2>{slide.content}</h2>
                </div>
                <ul className="swiper-video-question-list">
                  {slide.question?.map((q, key) => (
                    <li key={q.id}>
                      <input type="checkbox" id={q.id} />
                      <label htmlFor={q.id}>
                        <span>{String.fromCharCode(97 + key).toUpperCase()}</span> {q.title}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {slide.type === 'radiofield' && (
              <>
                <div className="--intro">
                  <h2>{slide.content}</h2>
                </div>
                <ul className="swiper-video-question-list --radiofield">
                  {slide.question?.map((q, key) => (
                    <li key={q.id}>
                      <input type="radio" id={q.id} name={slide.content} />
                      <label htmlFor={q.id}>
                        <span>{String.fromCharCode(97 + key).toUpperCase()}</span> {q.title}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <video
            src={slide.src}
            autoPlay={isActive}
            muted={muted}
            loop={true}
          />
        </div>
      )}
      {!isActive && (
        <div className="swiper-video-content">
          <video
            src={slide.src}
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
  ...props
}: VideoSliderWidgetProps) {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);

  const handleSwiperClick = (swiper: any, event: Event) => {
    if (muted) {
      const target = event.target as HTMLElement;
      if (target.closest('input') || target.closest('label')) {
        return;
      }
      setMuted(false);
    }
  };

  return (
    <div className="video-slider">
      <Swiper
        modules={[A11y]}
        direction='vertical'
        pagination={{ clickable: false }}
        onSwiper={(swiper) => console.log(swiper)}
        onSlideChange={(e) => setCurrent(e.activeIndex)}
        onClick={handleSwiperClick}
      >
        {defaultSlides.map((slide, index) => (
          <SwiperSlide key={index}>
            <Swipe slide={slide} active={index === current} muted={muted} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="video-slider-controls">
        <button onClick={() => setMuted(!muted)} className={`video-slider-mute-button ${muted ? '--muted' : ''}`}>
          <span>{muted ? 'Unmute' : 'Mute'}</span>
        </button>
      </div>
    </div>
  );
}


VideoSlider.loadWidget = loadWidget;

export { VideoSlider };
