import { describe, expect, test } from 'vitest';

import { InitializeWeights } from './init-weights';
import { calculateScoreForItem } from './scoreUtils';

const sliderItem = {
  type: 'a-b-slider',
  trigger: '1',
  weights: { '1': { weightX: '50', weightAB: 'A' } },
};

describe('InitializeWeights without configuration', () => {
  test.each([
    ['undefined items', undefined, [{ id: 1 }]],
    ['undefined choice options', [sliderItem], undefined],
    ['empty choice options', [sliderItem], []],
    ['nothing configured', undefined, undefined],
  ])('returns no weights for %s', (_label, items, choiceOptions) => {
    expect(
      InitializeWeights(items as any, choiceOptions as any, 'default', [])
    ).toEqual({});
  });

  test('skips empty entries in items and choice options', () => {
    expect(
      InitializeWeights(
        [undefined, sliderItem] as any,
        [undefined, { id: 1 }] as any,
        'default',
        []
      )
    ).toEqual({ 1: { 'a-b-slider-1': { x: 50, ab: 'A' } } });
  });
});

describe('calculateScoreForItem without configuration', () => {
  test.each([
    ['an undefined choice option', undefined],
    ['an empty choice option list', []],
    ['a list with only empty entries', [undefined, null]],
  ])('returns a zero score for %s', (_label, choiceOption) => {
    expect(
      calculateScoreForItem(
        choiceOption as any,
        {},
        {},
        'default',
        [],
        undefined as any
      )
    ).toEqual({ x: 0, y: 0, z: 0 });
  });
});
