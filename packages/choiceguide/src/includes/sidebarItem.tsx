import React, { useEffect, useState } from 'react';
import { ChoiceOptions, Score } from '../props';
import { calculateColor, calculateScoreForItem } from '../parts/scoreUtils';

const defaultBarColor = {
  default: '#bed200',
  min: '#ff9100',
  max: '#bed200',
};

type ChoiceItemProps = {
  choiceOption: ChoiceOptions;
  answers: Record<string, string>;
  weights: Record<string, Record<string, Record<string, any>>>;
  choicesType: 'default' | 'minus-to-plus-100' | 'plane' | 'hidden';
  choicesPreferenceMinColor?: string;
  choicesPreferenceMaxColor?: string;
  showPageCountAndCurrentPageInButton?: boolean;
};

const ChoiceItem: React.FC<ChoiceItemProps> = (props) => {
  const [score, setScore] = useState<Score>({ x: 0, y: 0, z: 0 });

  // Calculate score for this item
  useEffect(() => {
    const itemScore = calculateScoreForItem(
      props.choiceOption,
      props.answers,
      props.weights,
      props.choicesType
    );
    setScore(itemScore);
  }, [props.choiceOption, props.answers, props.weights]);

  const renderScore = () => {
    if (props.choicesType === 'minus-to-plus-100') {
      const percentage = parseInt((2 * (score.x - 50)).toString()) || 0;
      const backgroundColor = calculateColor(score.x, props.choicesPreferenceMinColor, props.choicesPreferenceMaxColor);

      const style = {
        backgroundColor,
        width: percentage >= 0 ? `${percentage / 2}%` : `${-percentage / 2}%`,
        left: percentage >= 0 ? '50%' : 'auto',
        right: percentage < 0 ? '50%' : 'auto',
      };
      return (
        <div className="osc-choice-default">
          <h4>{props.choiceOption?.title}</h4>
          <div className="osc-choice-bar osc-from-center">
            <div className="osc-choice-bar-progress" style={style}></div>
          </div>
        </div>
      );
    } else {
      const percentageValue = parseInt(score.x.toString()) || 0;
      return (
        <div className="osc-choice-default">
          <h4>{props.choiceOption?.title}</h4>
          <div className="osc-choice-bar">
            <div className="osc-choice-bar-mask"></div>
            <div className="osc-choice-bar-progress"
                 style={{width: `${score.x}%`, backgroundColor: defaultBarColor.default}}></div>
          </div>
        </div>
      );
    }
  };

  return renderScore();
};

export default ChoiceItem;
