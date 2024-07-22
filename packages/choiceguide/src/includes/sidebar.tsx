import React from 'react';
import { ChoiceGuideSidebarProps } from '../props';
import ChoiceItem from './sidebarItem';

const ChoiceGuideSidebar: React.FC<ChoiceGuideSidebarProps> = (props) => {
  const baseSize = document.querySelector(`#choice-plane`)?.clientWidth || 180;

  return (
    <div className="osc-choices-container">

      { !!props.choicesType && props.choicesType === 'plane' && (
        <div id="choice-plane" className="osc-choice-plane" style={{ width: baseSize / 2, height: baseSize / 2 }}>

          <div className="osc-point" style={{ top: `${score.y}%`, left: `${score.x}%` }}></div>
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
  );
};

export { ChoiceGuideSidebar };
