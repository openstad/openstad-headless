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

function Swipe({ 
  slide, 
  active, 
  muted, 
  autoPlay, 
  formAnswers, 
  updateAnswer, 
  updateMultipleAnswer,
  updateSwipeAnswer
}: { 
  slide: any, 
  active: boolean, 
  muted: boolean, 
  autoPlay: boolean,
  formAnswers: { [key: string]: any },
  updateAnswer: (fieldKey: string, value: any) => void,
  updateMultipleAnswer: (fieldKey: string, value: string, checked: boolean) => void,
  updateSwipeAnswer: (fieldKey: string, swipeData: any) => void
}) {
  const [isActive, setActive] = useState(active);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setActive(active);
    
    if (videoRef.current) {
      if (active) {
        // Reset video to beginning when slide becomes active
        videoRef.current.currentTime = 0;
        if (autoPlay) {
          videoRef.current.play().catch(console.error);
        }
      } else {
        // Pause video when slide becomes inactive
        videoRef.current.pause();
      }
    }
  }, [active, autoPlay]);

  return (
    <div className="swiper-video-container">
      <div className="swiper-video-content" style={{ display: isActive ? 'block' : 'none' }}>
        <div className="swiper-video-question">
          <div className="--intro">
            {slide.title && (<h2>{slide.title}</h2>)}
            {slide.description && (<p>{slide.description}</p>)}
          </div>
          {slide.questionType === 'multiple' && (
            <ul className="swiper-video-question-list">
              {slide.options?.map((q, key) => {
                const fieldKey = `${slide.id || slide.trigger}_multiple`;
                const isChecked = (formAnswers[fieldKey] || []).includes(q.titles[0].key);
                
                return (
                  <li key={q.id}>
                    <input
                      type="checkbox"
                      id={`${slide.id || slide.trigger}_${q.titles[0].key}`}
                      name={fieldKey}
                      value={q.titles[0].key}
                      checked={isChecked}
                      onChange={(e) => updateMultipleAnswer(fieldKey, q.titles[0].key, e.target.checked)}
                    />
                    <label htmlFor={`${slide.id || slide.trigger}_${q.titles[0].key}`}>
                      <span>{String.fromCharCode(97 + key).toUpperCase()}</span> {q.titles[0].key}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {slide.questionType === 'multiplechoice' && (
            <ul className="swiper-video-question-list --radiofield">
              {slide.options?.map((q, key) => {
                const fieldKey = `${slide.id || slide.trigger}_multiplechoice`;
                const isChecked = formAnswers[fieldKey] === q.titles[0].key;
                
                return (
                  <li key={q.id}>
                    <input
                      type="radio"
                      id={`${slide.id || slide.trigger}_${q.titles[0].key}`}
                      name={fieldKey}
                      value={q.titles[0].key}
                      checked={isChecked}
                      onChange={(e) => updateAnswer(fieldKey, e.target.value)}
                    />
                    <label htmlFor={`${slide.id || slide.trigger}_${q.titles[0].key}`}>
                      <span>{String.fromCharCode(97 + key).toUpperCase()}</span> {q.titles[0].key}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {slide.questionType === 'swipe' && (
            <ul className="swiper-video-question-list">
              <li>
                <SwipeField
                  key={`${slide.id || slide.trigger}_swipe`}
                  cards={slide?.options?.map((card: any) => ({
                    id: card.trigger,
                    description: card.titles[0].key,
                    image: card.titles[0].image || '',
                  }))}
                  onSwipeLeft={(card) => {
                    console.log(card)
                    const fieldKey = `${slide.id || slide.trigger}_swipe`;
                    //Still bugged..
                    // updateSwipeAnswer(fieldKey, { action: 'left', card: card });
                  }}
                  onSwipeRight={(card) => {
                    console.log(card)
                    const fieldKey = `${slide.id || slide.trigger}_swipe`;
                    //Still bugged..
                    // updateSwipeAnswer(fieldKey, { action: 'right', card: card });
                  }}
                />
              </li>
            </ul>
          )}

          {slide.questionType === 'scale' && (
            <div className="swiper-video-question-list">
              <TickmarkSlider
                showSmileys={slide.showSmileys}
                onChange={(value) => {
                  const fieldKey = `${slide.id || slide.trigger}_scale`;
                  updateAnswer(fieldKey, value);
                }}
                index={0}
                title=""
                fieldOptions={[
                  { value: '1', label: slide.showSmileys ? <><div>😡</div><span className="value">Slecht</span></> as any : '1' },
                  { value: '2', label: slide.showSmileys ? <div>🙁</div> as any : '2' },
                  { value: '3', label: slide.showSmileys ? <div>😐</div> as any : '3' },
                  { value: '4', label: slide.showSmileys ? <div>😀</div> as any : '4' },
                  { value: '5', label: slide.showSmileys ? <><div>😍</div><span className="value">Goed</span></> as any : '5' },
                ]}
                fieldRequired={false}
                fieldKey=""
              />
            </div>
          )}

          {slide.questionType === 'images' && !slide.multiple && (
            <div className="swiper-video-question-list">
              <div className="question-type-imageChoice">
                <ImageChoiceField
                  title=""
                  description=""
                  choices={slide.options?.map((option: any) => ({
                    imageSrc: option.titles[0].image,
                    imageAlt: option.titles[0].text || '',
                    label: option.titles[0].key,
                    value: option.titles[0].key,
                  }))}
                  fieldKey={slide.fieldKey}
                  fieldRequired={slide.fieldRequired}
                  multiple={slide.multiple}
                  view={slide.view}
                  randomId={`img-choice-${Math.random().toString(36).substring(2, 15)}`}
                  onChange={(e) => {
                    const fieldKey = `${slide.id || slide.trigger}_images`;
                    updateAnswer(fieldKey, e.value);
                  }}
                />
              </div>
            </div>
          )}

        </div>
        {slide.videoUrl && (
          <div className="vid-container">
            <video
              ref={videoRef}
              src={slide.videoUrl}
              autoPlay={isActive && autoPlay}
              muted={muted}
              loop={true}
            />
          </div>
        )}
      </div>

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
  const [horizontalSlideIndex, setHorizontalSlideIndex] = useState<{ [key: number]: number }>({});
  const [formAnswers, setFormAnswers] = useState<{ [key: string]: any }>({});
  const swiperRef = useRef<SwiperType | null>(null);

  const slides = props?.items || baseSlides;

  // Helper function to update answers in state
  const updateAnswer = (fieldKey: string, value: any) => {
    setFormAnswers(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  // Helper function to handle multiple choice answers (checkboxes)
  const updateMultipleAnswer = (fieldKey: string, value: string, checked: boolean) => {
    setFormAnswers(prev => {
      const currentAnswers = prev[fieldKey] || [];
      if (checked) {
        return {
          ...prev,
          [fieldKey]: [...currentAnswers, value]
        };
      } else {
        return {
          ...prev,
          [fieldKey]: currentAnswers.filter((item: string) => item !== value)
        };
      }
    });
  };

  // Helper function to handle swipe answers (accumulating all swipes)
  const updateSwipeAnswer = (fieldKey: string, swipeData: any) => {
    setFormAnswers(prev => {
      const currentAnswers = prev[fieldKey] || [];
      const existingIndex = currentAnswers.findIndex((item: any) => item.card.id === swipeData.card.id);
      
      if (existingIndex !== -1) {
        const updatedAnswers = [...currentAnswers];
        updatedAnswers[existingIndex] = swipeData;
        return {
          ...prev,
          [fieldKey]: updatedAnswers
        };
      } else {
        return {
          ...prev,
          [fieldKey]: [...currentAnswers, swipeData]
        };
      }
    });
  };

  // Group slides by their group property
  const groupedSlides = useMemo(() => {
    const groups: { [key: string]: { slides: any[], firstIndex: number } } = {};
    const result: any[] = [];

    slides.forEach((slide, index) => {
      if (slide.group) {
        if (!groups[slide.group]) {
          groups[slide.group] = { slides: [], firstIndex: index };
        }
        groups[slide.group].slides.push(slide);
      } else {
        result.push({ type: 'single', slide, originalIndex: index });
      }
    });

    // Insert grouped slides at their first occurrence position
    Object.entries(groups).forEach(([groupName, { slides: groupSlides, firstIndex }]) => {
      result.splice(firstIndex, 0, { 
        type: 'group', 
        group: groupName, 
        slides: groupSlides,
        originalIndex: firstIndex
      });
    });

    return result.sort((a, b) => a.originalIndex - b.originalIndex);
  }, [slides]);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Use the state-managed form answers instead of FormData
    const allData = {
      formInputs: formAnswers,
    };
    
    // TODO: Handle form submission
    console.log('Form submitted with data:', allData);
  };

  return (
    <div className="video-slider">
      <form className="video-slider-form" onSubmit={handleSubmit}>
        <Swiper
          modules={[A11y]}
          direction='vertical'
          pagination={{ clickable: false }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(e) => setCurrent(e.activeIndex)}
        >
          {groupedSlides.map((item, index) => (
            <SwiperSlide key={index}>
              {item.type === 'single' ? (
                <Swipe 
                  slide={item.slide} 
                  active={index === current} 
                  muted={muted} 
                  autoPlay={autoPlay}
                  formAnswers={formAnswers}
                  updateAnswer={updateAnswer}
                  updateMultipleAnswer={updateMultipleAnswer}
                  updateSwipeAnswer={updateSwipeAnswer}
                />
              ) : (
                <Swiper
                  direction='horizontal'
                  pagination={{ clickable: true }}
                  onSlideChange={(swiper) => {
                    // Update the horizontal slide index for this group
                    setHorizontalSlideIndex(prev => ({
                      ...prev,
                      [index]: swiper.activeIndex
                    }));
                  }}
                >
                  {item.slides.map((slide: any, slideIndex: number) => (
                    <SwiperSlide key={slideIndex}>
                      <Swipe
                        slide={slide}
                        active={index === current && (horizontalSlideIndex[index] ?? 0) === slideIndex}
                        muted={muted}
                        autoPlay={autoPlay}
                        formAnswers={formAnswers}
                        updateAnswer={updateAnswer}
                        updateMultipleAnswer={updateMultipleAnswer}
                        updateSwipeAnswer={updateSwipeAnswer}
                      />
                      {slideIndex < item.slides.length - 1 && (
                        <button
                          className="video-slide--next"
                          type="button"
                          onClick={() => {
                            const swiperEl = document.querySelector('.swiper-horizontal') as any;
                            if (swiperEl && swiperEl.swiper) {
                              swiperEl.swiper.slideNext();
                            }
                          }}
                        >
                          Volgende
                        </button>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
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

        {/* Debug section - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="video-slider-debug" style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px',
            maxWidth: '300px',
            fontSize: '12px',
            zIndex: 1000
          }}>
            <h4>Debug - Form Answers:</h4>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(formAnswers, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </div>
  );
}


VideoSlider.loadWidget = loadWidget;

export { VideoSlider };
