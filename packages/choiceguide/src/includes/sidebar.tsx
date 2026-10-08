import React, { useEffect, useState } from 'react';

import { calculateScoreForItem } from '../parts/scoreUtils';
import type { ChoiceGuideSidebarProps, ChoiceOptions, Score } from '../props';
import ChoiceItem from './sidebarItem';

function ChoiceGuideSidebar(props: ChoiceGuideSidebarProps) {
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
  }, [
    props.choiceOptions,
    props.answers,
    props.weights,
    props.choicesType,
    props.hiddenFields,
    props.items,
  ]);

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
  }, [score.x, score.y]);

  const defaultExpanded =
    props.stickyBarDefaultOpen !== undefined
      ? props.stickyBarDefaultOpen
      : true;
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className="osc-choices-container"
      id={`osc-choice-container-${props.widgetId || ''}`}
      role="status">
      <button
        aria-expanded={expanded}
        className="expand-trigger"
        onClick={() => setExpanded(!expanded)}>
        <h4>{expanded ? 'Details verbergen' : 'Details bekijken'} </h4>
      </button>
      <div aria-hidden={!expanded} className="expand-container">
        <div>
          <div className="expand-content">
            {props.choicesType === 'plane' ? (
              <div className="osc-choice-plane" id="choice-plane">
                {Object.entries(props.choiceOptions || {}).map(
                  ([key, choiceOption], index) => {
                    const option: ChoiceOptions = choiceOption as ChoiceOptions;

                    let imageHTML = null;
                    const image = (option && option.image) || '';
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
                  data-score-y={Math.round(parseFloat(score.y.toString()))}
                />
              </div>
            ) : (
              <ul className="osc-choices">
                {Object.entries(props.choiceOptions || {}).map(
                  ([key, choiceOption], index) => (
                    <li className="osc-choice" key={index}>
                      <ChoiceItem
                        answers={props.answers}
                        choiceOption={choiceOption}
                        choicesPreferenceMaxColor={
                          props.choicesPreferenceMaxColor
                        }
                        choicesPreferenceMinColor={
                          props.choicesPreferenceMinColor
                        }
                        choicesType={props.choicesType}
                        displayDescription={props?.displayDescription}
                        displayImage={props?.displayImage}
                        displayTitle={props?.displayTitle}
                        hiddenFields={props.hiddenFields}
                        items={props.items}
                        showPageCountAndCurrentPageInButton={
                          props.showPageCountAndCurrentPageInButton
                        }
                        startWithAllQuestionsAnswered={
                          props.startWithAllQuestionsAnswered
                        }
                        imageClickable={props?.imageClickable}
                        weights={props.weights}
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
}

export { ChoiceGuideSidebar };
