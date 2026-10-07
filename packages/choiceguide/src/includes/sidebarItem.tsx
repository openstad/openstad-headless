import { Heading4, Paragraph } from '@utrecht/component-library-react';
import React, { useEffect, useRef, useState } from 'react';

import { ClickableImage } from '../../../ui/src/clickable-image';
import RteContent from '../../../ui/src/rte-formatting/rte-content';
import { calculateColor, calculateScoreForItem } from '../parts/scoreUtils';
import { ChoiceOptions, Item, Score } from '../props';

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
  hiddenFields?: string[];
  items?: Array<Item>;
  imageClickable?: boolean;
};

const ChoiceItem: React.FC<ChoiceItemProps> = (props) => {
  const [score, setScore] = useState<Score>({ x: 0, y: 0, z: 0 });

  const {
    displayTitle = true,
    displayScore = true,
    displayDescription = false,
    displayImage = false,
    imageClickable = false,
  } = props || {};

  // Calculate score for this item
  useEffect(() => {
    const itemScore = calculateScoreForItem(
      props.choiceOption,
      props.answers,
      props.weights,
      props.choicesType,
      props.hiddenFields,
      props.items
    );
    setScore(itemScore);
  }, [props.choiceOption, props.answers, props.weights]);

  const renderScore = () => {
    if (props.choicesType === 'minus-to-plus-100') {
      const percentage = parseFloat((2 * (score.x - 50)).toString()) || 0;
      const backgroundColor = calculateColor(
        score.x,
        props.choicesPreferenceMinColor,
        props.choicesPreferenceMaxColor
      );

      document.documentElement.style.setProperty(
        '--choiceguide-minus-to-plus-width',
        `${percentage >= 0 ? percentage / 2 : -percentage / 2}%`
      );
      document.documentElement.style.setProperty(
        '--choiceguide-minus-to-plus-bg',
        backgroundColor
      );

      const getClass = (perc: number) => {
        if (perc < 0) {
          return 'osc-choice-bar-progress-negative';
        } else {
          return 'osc-choice-bar-progress-positive';
        }
      };

      const percentageValue =
        percentage >= 0 ? percentage / 2 : -percentage / 2;

      return (
        <div
          className="osc-choice-default minus-to-plus"
          data-score={Math.round(percentageValue)}>
          {props.choiceOption?.title && <h4>{props.choiceOption.title}</h4>}
          <div className="osc-choice-bar osc-from-center osc-with-percentage">
            <div
              className={`osc-choice-bar-progress ${getClass(
                percentage
              )}`}></div>
          </div>
          {/* ponytail: tekstueel scorealternatief -> niet alleen kleur (1.4.1) + voorleesbaar (1.3.1) */}
          <span className="osc-percentage">
            {percentage > 0 ? '+' : ''}
            {Math.round(percentage)}%
          </span>
        </div>
      );
    } else {
      const percentageValue = parseFloat(score.x.toString()) || 0;

      document.documentElement.style.setProperty(
        '--choiceguide-not-minus-to-plus-bg',
        defaultBarColor.default
      );

      return (
        <div className="osc-choice-default not-minus-to-plus">
          {displayTitle && props.choiceOption?.title && (
            <Heading4>{props.choiceOption.title}</Heading4>
          )}
          {displayDescription && props.choiceOption?.description && (
            <div className="osc-choice-description">
              <RteContent
                content={props.choiceOption.description}
                inlineComponent="p"
                unwrapSingleRootDiv={true}
              />
            </div>
          )}
          {displayScore && (
            <>
              <div className="osc-choice-bar osc-with-percentage">
                <div className="osc-choice-bar-mask"></div>
                <div
                  className="osc-choice-bar-progress"
                  data-score={Math.round(percentageValue)}></div>
              </div>
              {/* ponytail: tekstueel scorealternatief -> niet alleen kleur (1.4.1) + voorleesbaar (1.3.1) */}
              <span className="osc-percentage">
                {Math.round(percentageValue)}%
              </span>
            </>
          )}
          {displayImage && props.choiceOption?.image && (
            <div className="osc-choice-image-container">
              <ClickableImage
                clickable={imageClickable}
                src={props.choiceOption.image}
                alt={props.choiceOption.title}>
                <img
                  src={props.choiceOption.image}
                  alt={props.choiceOption.title}
                  className="osc-choice-image"
                />
              </ClickableImage>
            </div>
          )}
        </div>
      );
    }
  };

  return renderScore();
};

export default ChoiceItem;
