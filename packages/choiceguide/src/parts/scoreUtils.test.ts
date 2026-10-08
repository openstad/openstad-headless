import { describe, expect, test } from 'vitest';

import { InitializeWeights } from './init-weights';
import { calculateScoreForItem } from './scoreUtils';

const sliderItem = (
  trigger: string,
  weights: Record<string, { weightX?: string; weightAB?: string }>
) => ({
  type: 'a-b-slider',
  trigger,
  weights,
});

const sliderAnswer = (value: string) => ({
  value,
  skipQuestion: false,
  skipQuestionExplanation: '',
});

const choiceOptions = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

const items = [
  sliderItem('6', {
    '1': { weightX: '75', weightAB: 'A' },
    '2': { weightX: '100', weightAB: 'B' },
    '3': { weightX: '25', weightAB: 'A' },
    '4': { weightX: '0', weightAB: 'B' },
  }),
  sliderItem('8', {
    '1': { weightX: '25', weightAB: 'A' },
    '2': { weightX: '75', weightAB: 'A' },
    '3': { weightX: '100', weightAB: 'B' },
    '4': { weightAB: 'A' },
  }),
  sliderItem('9', {
    '1': { weightX: '100', weightAB: 'A' },
    '2': { weightX: '25', weightAB: 'B' },
    '3': { weightX: '0', weightAB: 'B' },
    '4': { weightX: '75', weightAB: 'A' },
  }),
  sliderItem('11', {
    '1': { weightAB: 'A' },
    '2': { weightX: '100', weightAB: 'A' },
    '3': { weightX: '75', weightAB: 'B' },
    '4': { weightX: '25', weightAB: 'B' },
  }),
  sliderItem('13', {
    '1': { weightX: '75', weightAB: 'A' },
    '2': { weightX: '25', weightAB: 'A' },
    '3': { weightX: '100', weightAB: 'B' },
    '4': { weightAB: 'A' },
  }),
  sliderItem('15', {
    '1': { weightX: '75', weightAB: 'A' },
    '2': { weightX: '75', weightAB: 'B' },
    '3': { weightX: '25', weightAB: 'A' },
    '4': { weightX: '25', weightAB: 'A' },
  }),
  sliderItem('17', {
    '1': { weightAB: 'A' },
    '2': { weightX: '100', weightAB: 'A' },
    '3': { weightX: '100', weightAB: 'B' },
    '4': { weightAB: 'A' },
  }),
  sliderItem('20', {
    '1': { weightX: '75', weightAB: 'B' },
    '2': { weightX: '25', weightAB: 'B' },
    '3': { weightX: '75', weightAB: 'A' },
    '4': { weightX: '25', weightAB: 'A' },
  }),
  sliderItem('21', {
    '1': { weightX: '100', weightAB: 'A' },
    '2': { weightX: '25', weightAB: 'B' },
    '3': { weightX: '0', weightAB: 'A' },
    '4': { weightX: '75', weightAB: 'B' },
  }),
];

const allSlidersFullB = Object.fromEntries(
  items.map((item) => [`a-b-slider-${item.trigger}`, sliderAnswer('100')])
);

const scoreFor = (
  optionId: number,
  choicesType: 'default' | 'minus-to-plus-100' | 'plane' | 'hidden',
  answers: Record<string, unknown> = allSlidersFullB
) => {
  const weights = InitializeWeights(items, choiceOptions, choicesType, []);
  return calculateScoreForItem(
    { id: optionId },
    answers as Record<string, string>,
    weights,
    choicesType,
    [],
    items as never
  );
};

describe('calculateScoreForItem with a-b-slider weights', () => {
  test('default: weighted percentages for all sliders on full B', () => {
    expect(scoreFor(1, 'default').x).toBeCloseTo(14.29, 2);
    expect(scoreFor(2, 'default').x).toBeCloseTo(45.45, 2);
    expect(scoreFor(3, 'default').x).toBeCloseTo(75, 2);
    expect(scoreFor(4, 'default').x).toBeCloseTo(44.44, 2);
  });

  test('default: score never exceeds 100', () => {
    for (const option of choiceOptions) {
      expect(scoreFor(option.id, 'default').x).toBeLessThanOrEqual(100);
    }
  });

  test('hidden scores identically to default', () => {
    for (const option of choiceOptions) {
      expect(scoreFor(option.id, 'hidden').x).toBeCloseTo(
        scoreFor(option.id, 'default').x,
        6
      );
    }
  });

  test('minus-to-plus-100 keeps the distance-to-center formula', () => {
    const singleItem = [
      sliderItem('6', { '1': { weightX: '100', weightAB: 'B' } }),
    ];
    const weights = InitializeWeights(
      singleItem,
      [{ id: 1 }],
      'minus-to-plus-100',
      []
    );

    const centered = calculateScoreForItem(
      { id: 1 },
      { 'a-b-slider-6': sliderAnswer('50') } as never,
      weights,
      'minus-to-plus-100',
      [],
      singleItem as never
    );
    const fullB = calculateScoreForItem(
      { id: 1 },
      { 'a-b-slider-6': sliderAnswer('100') } as never,
      weights,
      'minus-to-plus-100',
      [],
      singleItem as never
    );

    expect(centered.x).toBeCloseTo(100, 6);
    expect(fullB.x).toBeCloseTo(50, 6);
  });
});
