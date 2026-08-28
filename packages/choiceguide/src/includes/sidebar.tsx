import React, { useEffect, useState } from 'react';

import { calculateScoreForItem } from '../parts/scoreUtils';
import { ChoiceGuideSidebarProps, ChoiceOptions, Score } from '../props';
import ChoiceItem from './sidebarItem';

const ChoiceGuideSidebar: React.FC<ChoiceGuideSidebarProps> = (props) => {
  const [score, setScore] = useState<Score>({ x: 50, y: 50, z: 0 });

  // Calculate score for this item
  useEffect(() => {
    const itemScore = calculateScoreForItem(
      props.choiceOptions,
      props.answers,
      props.weights,
      props.choicesType,
      props.hiddenFields,
      props.items
    );
    setScore(itemScore);
  }, [props.choiceOptions, props.answers, props.weights]);

  // ponytail: hier stond een effect dat --choiceguide-base-size op de
  // containerbreedte zette. Het hing aan een ref die nergens aan vastzat, dus
  // het liep nooit; toen die ref wél was aangehangen bleek het schadelijk — het
  // keuzevlak is vierkant, dus een breedte van 610px gaf ook 610px hoogte en
  // een schermvullend paneel (GTT-33.F10). De defaults staan gewoon in de CSS
  // (.openstad { --choiceguide-base-size: 180px }), dus weg ermee.

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--choiceguide-score-x',
      `${score.x}%`
    );
    document.documentElement.style.setProperty(
      '--choiceguide-score-y',
      `${score.y}%`
    );
  }, [score]);

  const defaultExpanded =
    props.stickyBarDefaultOpen !== undefined
      ? props.stickyBarDefaultOpen
      : true;
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className="osc-choices-container"
      role="status"
      id={`osc-choice-container-${props.widgetId || ''}`}>
      <button
        className="expand-trigger"
        aria-expanded={expanded}
        onClick={(e) => setExpanded(!expanded)}>
        <h4>{expanded ? 'Details verbergen' : 'Details bekijken'} </h4>
      </button>
      <div className="expand-container" aria-hidden={!expanded}>
        <div>
          <div className="expand-content">
            {props.choicesType === 'plane' ? (
              <div id="choice-plane" className="osc-choice-plane">
                {Object.entries(props.choiceOptions || {}).map(
                  ([key, choiceOption], index) => {
                    const option: ChoiceOptions = choiceOption as ChoiceOptions;

                    let imageHTML = null;
                    let image = (option && option.image) || '';
                    if (image) {
                      imageHTML = (
                        <img
                          className="osc-choice-plane-background-image"
                          src={image}
                          alt={option.title}
                        />
                      );
                    }

                    return <div className="osc-choice-plane">{imageHTML}</div>;
                  }
                )}

                <div
                  className="osc-point"
                  data-score-x={Math.round(parseFloat(score.x.toString()))}
                  data-score-y={Math.round(
                    parseFloat(score.y.toString())
                  )}></div>
              </div>
            ) : (
              <ul className="osc-choices">
                {Object.entries(props.choiceOptions || {}).map(
                  ([key, choiceOption], index) => (
                    <li key={index} className="osc-choice">
                      <ChoiceItem
                        choiceOption={choiceOption}
                        answers={props.answers}
                        weights={props.weights}
                        choicesType={props.choicesType}
                        choicesPreferenceMinColor={
                          props.choicesPreferenceMinColor
                        }
                        choicesPreferenceMaxColor={
                          props.choicesPreferenceMaxColor
                        }
                        showPageCountAndCurrentPageInButton={
                          props.showPageCountAndCurrentPageInButton
                        }
                        startWithAllQuestionsAnswered={
                          props.startWithAllQuestionsAnswered
                        }
                        hiddenFields={props.hiddenFields}
                        items={props.items}
                        displayTitle={props?.displayTitle}
                        displayDescription={props?.displayDescription}
                        displayImage={props?.displayImage}
                        imageClickable={props?.imageClickable}
                      />
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ChoiceGuideSidebar };
