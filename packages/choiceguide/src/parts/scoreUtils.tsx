// @ts-nocheck
import {ChoiceOptions, Score} from "../props";

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
  choicesType: 'default' | 'minus-to-plus-100' | 'plane' | 'hidden'
): Score => {
    const results: Score = { x: 0, y: 0, z: 0 };
    let totalScores = { x: 0, y: 0, z: 0 };
    let countScores = { x: 0, y: 0, z: 0 };

    const choiceOptionsArray = Array.isArray(choiceOption) ? choiceOption : [choiceOption];

    choiceOptionsArray.forEach((option) => {
        Object.keys(weights[option.id] || {}).forEach((answerKey) => {
            const optionWeights = weights[option.id][answerKey];

            ['x', 'y', 'z'].forEach((dimension) => {
                if (typeof optionWeights[dimension] === 'number' && optionWeights[dimension] !== 0) {
                    countScores[dimension] += Number(optionWeights[dimension]);
                }
            });

            Object.keys(optionWeights).forEach((optionId) => {
                const secondOptionWeights = optionWeights[optionId];

                ['x', 'y', 'z'].forEach((secondDimension) => {
                    if (typeof secondOptionWeights[secondDimension] === 'number' && secondOptionWeights[secondDimension] !== 0) {
                        countScores[secondDimension] += Number(secondOptionWeights[secondDimension]);
                    }
                });
            });
        });

        Object.keys(answers).forEach((answerKey) => {
            const answerByName = answers[answerKey];

            if (answerByName === "") return;

            let answerArray;

            if (answerByName.startsWith('[') && answerByName.endsWith(']')) {
                answerArray = JSON.parse(answerByName);
            } else {
                answerArray = [answerByName];
            }

            answerArray.forEach((userAnswer) => {
                const optionWeights = weights[option.id]?.[answerKey];

                if (optionWeights) {
                    if (typeof userAnswer === 'string' && optionWeights[userAnswer]) {
                        const dimensions = optionWeights[userAnswer];
                        Object.keys(dimensions).forEach((thirdDimension) => {
                            const number = Number(dimensions[thirdDimension]);

                            if (isNaN(number)) return;

                            const singleScore = choicesType === 'default'
                              ? number
                              : 100 - Math.abs(number - 50);

                            totalScores[thirdDimension] += singleScore;
                        });
                    } else {
                        Object.keys(optionWeights).forEach((fifthDimension) => {
                            const number = Number(optionWeights[fifthDimension]);

                            if (isNaN(number)) return;

                            const fieldValue = Number(userAnswer);

                            const reverseValue = optionWeights.hasOwnProperty('ab') && optionWeights.ab === 'A';
                            const valueBasedOnAB = reverseValue ? (100 - fieldValue) : fieldValue;

                            const rangeCalc = isNaN(valueBasedOnAB) ? '' : (valueBasedOnAB / 100) * number;

                            const finalNumber = rangeCalc === '' ? number : rangeCalc;

                            const singleScore = choicesType === 'default'
                              ? finalNumber
                              : 100 - Math.abs(finalNumber - 50);

                            totalScores[fifthDimension] += singleScore;
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