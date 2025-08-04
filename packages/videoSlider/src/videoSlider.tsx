import './videoSlider.css';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import type { BaseProps } from '@openstad-headless/types';
import { Pagination, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import SwipeField from '@openstad-headless/swipe/src/swipe';
import TickmarkSlider from "@openstad-headless/ui/src/form-elements/tickmark-slider";
import ImageChoiceField from '@openstad-headless/ui/src/form-elements/image-choice';


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

function Swipe({ slide, active, muted, autoPlay }: { slide: any, active: boolean, muted: boolean, autoPlay: boolean }) {
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
            <div className="--intro">
              {slide.title && (<h2>{slide.title}</h2>)}
              {slide.description && (<p>{slide.description}</p>)}
            </div>
            {slide.questionType === 'multiple' && (
              <>
                <ul className="swiper-video-question-list">
                  {slide.options?.map((q, key) => (
                    <li key={q.id}>
                      <input
                        type="checkbox"
                        id={`${slide.id || slide.trigger}_${q.titles[0].key}`}
                        name={`${slide.id || slide.trigger}_multiple`}
                        value={q.titles[0].key}
                      />
                      <label htmlFor={`${slide.id || slide.trigger}_${q.titles[0].key}`}>
                        <span>{String.fromCharCode(97 + key).toUpperCase()}</span> {q.titles[0].key}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {slide.questionType === 'multiplechoice' && (
              <>
                <ul className="swiper-video-question-list --radiofield">
                  {slide.options?.map((q, key) => (
                    <li key={q.id}>
                      <input
                        type="radio"
                        id={`${slide.id || slide.trigger}_${q.titles[0].key}`}
                        name={`${slide.id || slide.trigger}_multiplechoice`}
                        value={q.titles[0].key}
                      />
                      <label htmlFor={`${slide.id || slide.trigger}_${q.titles[0].key}`}>
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

            {slide.questionType === 'scale' && (() => {
              const labelOptions = [
                <><div key="1">😡</div><span className="value">Slecht</span></>,
                <><div key="2">🙁</div></>,
                <><div key="3">😐</div></>,
                <><div key="4">😀</div></>,
                <><div key="5">😍</div><span className="value">Goed</span></>,
              ]
              return (
                <>
                  <div className="swiper-video-question-list">
                    <TickmarkSlider
                      showSmileys={slide.showSmileys}
                      onChange={(value) => console.log('Slider value:', value)} index={0} title={''}
                      fieldOptions={labelOptions.map((label, index) => {
                        const currentValue = (index + 1).toString();
                        return {
                          value: currentValue,
                          label: slide.showSmileys ? label as any : currentValue,
                        }
                      })}
                      fieldRequired={false}
                      fieldKey={''} />
                  </div>
                </>
              );
            })()}

            {(slide.questionType === 'images' && slide.multiple === false) && (() => {
              console.log(slide)
              const choices = slide.options?.map((option: any) => ({
                imageSrc: option.titles[0].image,
                imageAlt: option.titles[0].text || '',
                label: option.titles[0].key,
                value: option.titles[0].key,
              }));
              return (
                <>
                  <div className="swiper-video-question-list">
                    <div className="question-type-imageChoice ">
                      <ImageChoiceField
                        title={''}
                        description={''}
                        choices={choices}
                        fieldKey={slide.fieldKey}
                        fieldRequired={slide.fieldRequired}
                        multiple={slide.multiple}
                        view={slide.view}
                        randomId={Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
                      />
                    </div>
                  </div>
                </>
              );
            })()}

          </div>
          {slide.videoUrl && (
            <div className="vid-container">
              <video
                src={slide.videoUrl}
                autoPlay={isActive && autoPlay}
                muted={muted}
                loop={true}
              />
            </div>
          )}
        </div>
      )}

      {!isActive && slide.videoUrl && (
        <div className="swiper-video-content">
          <div className="vid-container">
            <video
              src={slide.videoUrl}
              autoPlay={false}
              muted={true}
              loop={true}
            />
          </div>
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
  const [autoPlay, setAutoPlay] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);

  const slides = props?.items || baseSlides;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!swiperRef.current) return;

      const swiper = swiperRef.current;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        swiper.slideNext();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        swiper.slidePrev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const formEntries = Object.fromEntries(formData.entries());
    console.log('Form entries:', formEntries);

    // Combine all form data
    const allData = {
      formInputs: formEntries,
    };
    console.log('All form data:', allData);
  };


  return (
    <div className="video-slider">
      <form className="video-slider-form" onSubmit={(e) => {
        handleSubmit(e);
      }}>
        <Swiper
          modules={[A11y]}
          direction='vertical'
          pagination={{ clickable: false }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(e) => setCurrent(e.activeIndex)}
          onClick={handleSwiperClick}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <Swipe slide={slide} active={index === current} muted={muted} autoPlay={autoPlay} />
            </SwiperSlide>
          ))}
          <SwiperSlide key={'final-slide'}>
            <div className="final-slide">
              <h2>Dat waren alle vragen!</h2>
              <p>Bedankt voor het beantwoorden van de vragen.</p>
              <button type="submit">Versturen</button>
            </div>
          </SwiperSlide>
        </Swiper>

        <div className="video-slider-controls">
          <button
            onClick={() => {
              const videos = document.querySelectorAll('.vid-container video') as NodeListOf<HTMLVideoElement>;
              videos.forEach(video => {
                setAutoPlay(!autoPlay);
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              });
            }}
            className={`video-slider-play-button ${autoPlay ? '--autoplay' : ''}`}
          >
            <span>Speel/Pauzeer alle Videos</span>
          </button>
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
