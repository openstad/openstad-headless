import React, { useState, useEffect, useRef } from 'react';
import {ChoiceGuideSidebarProps, ChoiceOptions, Score} from '../props';
import ChoiceItem from './sidebarItem';
import {calculateScoreForItem} from "../parts/scoreUtils";

const ChoiceGuideSidebar: React.FC<ChoiceGuideSidebarProps> = (props) => {
  const [score, setScore] = useState<Score>({ x: 50, y: 50, z: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate score for this item
  useEffect(() => {
    const itemScore = calculateScoreForItem(
      props.choiceOptions,
      props.answers,
      props.weights,
      props.choicesType
    );
    setScore(itemScore);
  }, [props.choiceOptions, props.answers, props.weights]);

  useEffect(() => {
    if (containerRef.current) {
      const baseSize = containerRef.current.clientWidth;
      document.documentElement.style.setProperty('--choiceguide-base-size', `${baseSize}px`);
      document.documentElement.style.setProperty('--choiceguide-half-base-size', `${baseSize / 2}px`);

    }
  }, [props.widgetId]);

  useEffect(() => {
    document.documentElement.style.setProperty('--choiceguide-score-x', `${score.x}%`);
    document.documentElement.style.setProperty('--choiceguide-score-y', `${score.y}%`);
  }, [score]);

  const [expanded, setExpanded] = useState(true);

  return (
    <div className="osc-choices-container" role="status" id={`osc-choice-container-${props.widgetId || ""}`} >
      <button className="expand-trigger" aria-expanded={expanded} onClick={(e)=>setExpanded(!expanded)}>
        <h4>{expanded ? 'Details verbergen' : 'Details bekijken'} </h4>
      </button>
      <div className="expand-container" aria-hidden={!expanded}>
        <div>
          <div className="expand-content">
            {props.choicesType === 'plane' ? (
              <div id="choice-plane" className="osc-choice-plane">

                {Object.entries(props.choiceOptions || {}).map(([key, choiceOption], index) => {
                  const option: ChoiceOptions = choiceOption as ChoiceOptions;

                  let imageHTML = null;
                  let image = option && option.image || "";
                  if (image) {
                    imageHTML = (
                      <img className="osc-choice-plane-background-image" src={image} />
                    );
                  }

                  return (
                    <div className="osc-choice-plane">{imageHTML}</div>
                  )
                })}

                <div
                  className="osc-point"
                  data-score-x={Math.round(parseFloat((score.x).toString()))}
                  data-score-y={Math.round(parseFloat((score.y).toString()))}
                ></div>
              </div>
            ) : (
              <ul className="osc-choices">
                {Object.entries(props.choiceOptions || {}).map(([key, choiceOption], index) => (
                  <li key={index} className="osc-choice">
                    <ChoiceItem
                      choiceOption={choiceOption}
                      answers={props.answers}
                      weights={props.weights}
                      choicesType={props.choicesType}
                      choicesPreferenceMinColor={props.choicesPreferenceMinColor}
                      choicesPreferenceMaxColor={props.choicesPreferenceMaxColor}
                      showPageCountAndCurrentPageInButton={props.showPageCountAndCurrentPageInButton}
                      startWithAllQuestionsAnswered={props.startWithAllQuestionsAnswered}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ChoiceGuideSidebar };