// @ts-nocheck
import {ChoiceOptions, Score} from "../props";
import {Item} from "../props";

export const calculateColor = (score: number, minColor = '#ff9100', maxColor = '#bed200') => {
    const maxColorMatch = maxColor.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    const minColorMatch = minColor.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    if (maxColorMatch && minColorMatch) {
        const r = parseInt(minColorMatch[1], 16) + (parseInt(maxColorMatch[1], 16) - parseInt(minColorMatch[1], 16)) * (score / 100);
        const g = parseInt(minColorMatch[2], 16) + (parseInt(maxColorMatch[2], 16) - parseInt(minColorMatch[2], 16)) * (score / 100);
        const b = parseInt(minColorMatch[3], 16) + (parseInt(maxColorMatch[3], 16) - parseInt(minColorMatch[3], 16)) * (score / 100);
        return `rgb(${r},${g},${b})`;
    }
    return '#bed200';
};

export const calculateScoreForItem = (
  choiceOption: ChoiceOptions | ChoiceOptions[],
  answers: Record<string, string>,
  weights: Record<string, Record<string, Record<string, any>>>,
  choicesType: 'default' | 'minus-to-plus-100' | 'plane' | 'hidden',
  hiddenFields: string[],
  items: Item[]
): Score => {
    const results: Score = { x: 0, y: 0, z: 0 };
    let totalScores = { x: 0, y: 0, z: 0 };
    let countScores = { x: 0, y: 0, z: 0 };

    let choiceOptionsArray = Array.isArray(choiceOption) ? choiceOption : [choiceOption];

    if (choicesType === 'plane') {
        choiceOptionsArray = [{id: 'plane'}];
    }

    choiceOptionsArray.forEach((option) => {
        Object.keys(weights[option.id] || {}).forEach((answerKey) => {
            const optionWeights = weights[option.id][answerKey];

            ['x', 'y', 'z'].forEach((dimension) => {
                if (typeof optionWeights[dimension] === 'number' && optionWeights[dimension] !== 0) {
                    countScores[dimension] += Number(optionWeights[dimension]);
                }
            });

            const tempScores: Record<'x' | 'y' | 'z', number> = { x: 0, y: 0, z: 0 };

            Object.keys(optionWeights).forEach((optionId) => {
                const secondOptionWeights = optionWeights[optionId];

                const isRadioBox = answerKey.startsWith('radiobox');
                const isImageChoice = answerKey.startsWith('images');
                const imageChoiceTrigger = answerKey.replace('images-', '');
                const isImageChoiceMultiple = isImageChoice && items?.find(item => item?.trigger === imageChoiceTrigger && item?.multiple === true);

                ['x', 'y', 'z'].forEach((secondDimension) => {
                    const optionValue = secondOptionWeights[secondDimension];

                    if (typeof optionValue === 'number' && optionValue !== 0) {
                        if ( isRadioBox || (isImageChoice && !isImageChoiceMultiple) ) {
                            tempScores[secondDimension] = Math.max(tempScores[secondDimension], optionValue);
                        } else {
                            tempScores[secondDimension] += optionValue;
                        }
                    }
                });
            });

            ['x', 'y', 'z'].forEach((sixthDimension) => {
                countScores[sixthDimension] += tempScores[sixthDimension];
            });
        });

        Object.keys(answers).forEach((answerKey) => {
            const answerByName = answers[answerKey];

            if ((answerByName === "" || typeof answerByName !== 'string') && typeof answerByName !== 'object') return;

            let answerArray;

            if (typeof (answerByName) !== 'object' && answerByName.startsWith('[') && answerByName.endsWith(']')) {
                answerArray = JSON.parse(answerByName);
            } else {
                answerArray = [answerByName];
            }

            answerArray.forEach((userAnswer) => {
                const safeUserAnswer = typeof userAnswer === 'string' ? userAnswer?.replace(/\./g, '_DOT_') : userAnswer;
                const optionWeights = weights[option.id]?.[answerKey];

                if (optionWeights) {
                    if (typeof safeUserAnswer === 'string' && optionWeights[safeUserAnswer]) {
                        const dimensions = optionWeights[safeUserAnswer];
                        Object.keys(dimensions).forEach((thirdDimension) => {
                            const number = Number(dimensions[thirdDimension]);

                            if (isNaN(number)) return;

                            const singleScore = (choicesType === 'default' || choicesType === 'plane')
                              ? number
                              : 100 - Math.abs(number - 50);

                            totalScores[thirdDimension] += singleScore;
                        });
                    } else {
                        Object.keys(optionWeights).forEach((fifthDimension) => {
                            const number = Number(optionWeights[fifthDimension]);

                            if (isNaN(number)) return;

                            let fieldValue;

                            if ( answerKey.startsWith('a-b-slider') && typeof (userAnswer) === 'object') {
                                if ( userAnswer?.skipQuestion ) {
                                    countScores['x'] -= number;
                                    countScores['y'] -= number;
                                    countScores['z'] -= number;
                                    return;
                                }

                                try {
                                    fieldValue = Number(userAnswer?.value);
                                } catch (e) {
                                    fieldValue = 50;
                                }

                            } else {
                                fieldValue = Number(userAnswer);
                            }

                            const optionsHasAB = fifthDimension === 'x' && optionWeights.hasOwnProperty('ab') && optionWeights.ab === 'A';
                            const optionsHasABY = fifthDimension === 'y' && optionWeights.hasOwnProperty('aby') && optionWeights.aby === 'A';

                            const reverseValue = optionsHasAB || optionsHasABY;
                            const valueBasedOnAB = reverseValue ? (100 - fieldValue) : fieldValue;

                            const rangeCalc = isNaN(valueBasedOnAB) ? '' : (valueBasedOnAB / 100) * number;

                            const finalNumber = rangeCalc === '' ? number : rangeCalc;

                            const singleScore = (choicesType === 'default' || choicesType === 'plane')
                              ? finalNumber
                              : 100 - Math.abs(finalNumber - 50);

                            totalScores[fifthDimension] = totalScores[fifthDimension] + singleScore;
                        });
                    }
                }
            });
        });
    });

    results.x = countScores.x ? (totalScores.x / countScores.x) * 100 : 0;
    results.y = countScores.y ? (totalScores.y / countScores.y) * 100 : 0;
    results.z = countScores.z ? (totalScores.z / countScores.z) * 100 : 0;

    return results;
};