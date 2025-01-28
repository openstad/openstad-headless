import React, { useState, useEffect } from 'react';
import {ChoiceGuideSidebarProps, ChoiceOptions, Score} from '../props';
import ChoiceItem from './sidebarItem';
import {calculateScoreForItem} from "../parts/scoreUtils";

const ChoiceGuideSidebar: React.FC<ChoiceGuideSidebarProps> = (props) => {
  const [score, setScore] = useState<Score>({ x: 50, y: 50, z: 0 });

  // Calculate score for this item
  useEffect(() => {
    const itemScore = calculateScoreForItem(
      props.choiceOptions,
      props.answers,
      props.weights,
      props.choicesType
    );
    setScore(itemScore);
  }, [props.choiceOption, props.answers, props.weights]);

  const baseSize = document.getElementById(`osc-choice-container-${props.widgetId || ""}`)?.clientWidth || 180;

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
              <div id="choice-plane" className="osc-choice-plane" style={{ height: baseSize }}>

                {Object.entries(props.choiceOptions || {}).map(([key, choiceOption], index) => {
                  const option: ChoiceOptions = choiceOption as ChoiceOptions;

                  let imageHTML = null;
                  let image = option && option.image || "";
                  if (image) {
                    imageHTML = (
                      <img className="osc-choice-plane-background-image" src={image} style={{ width: baseSize / 2, height: baseSize / 2 }}/>
                    );
                  }

                  return (
                    <div className="osc-choice-plane" style={{width: baseSize / 2, height: baseSize / 2}}>{imageHTML}</div>
                  )
                })}

                <div className="osc-point" style={{top: `${score.y}%`, left: `${score.x}%`}}></div>
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
