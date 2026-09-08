import { describe, expect, test } from 'vitest';

import {
  buildCustomScaleFieldOptions,
  buildScaleChoices,
  getScaleDefaultStep,
  getScaleDisplay,
  getScaleStepCount,
} from './scale-steps';
import { Item } from './types/enquete-props';

const scaleItem = (overrides: Partial<Item> = {}): Item => ({
  trigger: '1',
  key: 'scale-question',
  questionType: 'scale',
  ...overrides,
});

describe('getScaleDisplay', () => {
  test('uses the configured display when present', () => {
    expect(getScaleDisplay(scaleItem({ scaleDisplay: 'custom' }))).toBe(
      'custom'
    );
  });

  test('derives smileys from the legacy showSmileys flag', () => {
    expect(getScaleDisplay(scaleItem({ showSmileys: true }))).toBe('smileys');
  });

  test('falls back to numbers for legacy items without showSmileys', () => {
    expect(getScaleDisplay(scaleItem())).toBe('numbers');
  });

  test('configured display wins over the legacy flag', () => {
    expect(
      getScaleDisplay(scaleItem({ scaleDisplay: 'numbers', showSmileys: true }))
    ).toBe('numbers');
  });
});

describe('getScaleStepCount', () => {
  test('custom display follows the number of configured steps', () => {
    const item = scaleItem({
      scaleDisplay: 'custom',
      scaleSteps: [{ label: 'a' }, { label: 'b' }, { label: 'c' }],
    });
    expect(getScaleStepCount(item)).toBe(3);
  });

  test('custom display never drops below the minimum', () => {
    const item = scaleItem({ scaleDisplay: 'custom', scaleSteps: [] });
    expect(getScaleStepCount(item)).toBe(2);
  });

  test('numbers display uses the configured step count', () => {
    const item = scaleItem({ scaleDisplay: 'numbers', scaleStepCount: 7 });
    expect(getScaleStepCount(item)).toBe(7);
  });

  test('numbers display clamps invalid counts to the default', () => {
    expect(getScaleStepCount(scaleItem({ scaleDisplay: 'numbers' }))).toBe(5);
    expect(
      getScaleStepCount(
        scaleItem({ scaleDisplay: 'numbers', scaleStepCount: 1 })
      )
    ).toBe(5);
    expect(
      getScaleStepCount(
        scaleItem({ scaleDisplay: 'numbers', scaleStepCount: 11 })
      )
    ).toBe(5);
    expect(
      getScaleStepCount(
        scaleItem({ scaleDisplay: 'numbers', scaleStepCount: 4.5 })
      )
    ).toBe(5);
  });

  test('smileys display is always five steps', () => {
    const item = scaleItem({ scaleDisplay: 'smileys', scaleStepCount: 8 });
    expect(getScaleStepCount(item)).toBe(5);
  });

  test('legacy item without scale fields keeps five steps', () => {
    expect(getScaleStepCount(scaleItem())).toBe(5);
    expect(getScaleStepCount(scaleItem({ showSmileys: true }))).toBe(5);
  });
});

describe('getScaleDefaultStep', () => {
  test('uses a configured default step inside the range', () => {
    expect(getScaleDefaultStep(scaleItem({ defaultValue: '2' }), 5)).toBe('2');
  });

  test('falls back to the middle when nothing is configured', () => {
    expect(getScaleDefaultStep(scaleItem(), 5)).toBe('3');
    expect(getScaleDefaultStep(scaleItem(), 4)).toBe('2');
  });

  test('falls back to the middle when the default is out of range', () => {
    expect(getScaleDefaultStep(scaleItem({ defaultValue: '9' }), 5)).toBe('3');
    expect(getScaleDefaultStep(scaleItem({ defaultValue: '0' }), 5)).toBe('3');
    expect(getScaleDefaultStep(scaleItem({ defaultValue: 'abc' }), 5)).toBe(
      '3'
    );
  });
});

describe('buildScaleChoices', () => {
  test('builds one choice per step with matching triggers', () => {
    const choices = buildScaleChoices(7);
    expect(choices).toHaveLength(7);
    expect(choices[0]).toEqual({ value: '1', label: '1', trigger: 'scale-1' });
    expect(choices[6]).toEqual({ value: '7', label: '7', trigger: 'scale-7' });
  });
});

describe('buildCustomScaleFieldOptions', () => {
  test('maps text and image steps to field options', () => {
    const options = buildCustomScaleFieldOptions([
      { label: 'Oneens' },
      { imageUrl: '/img/step2.png', imageAlt: 'Neutraal gezicht' },
      { label: 'Eens', imageUrl: '/img/step3.png', imageAlt: 'Blij gezicht' },
    ]);

    expect(options).toEqual([
      { value: '1', label: 'Oneens', image: undefined },
      {
        value: '2',
        label: '',
        image: { url: '/img/step2.png', alt: 'Neutraal gezicht' },
      },
      {
        value: '3',
        label: 'Eens',
        image: { url: '/img/step3.png', alt: 'Blij gezicht' },
      },
    ]);
  });

  test('pads missing steps with numeric fallbacks up to the minimum', () => {
    expect(buildCustomScaleFieldOptions(undefined)).toEqual([
      { value: '1', label: '1', image: undefined },
      { value: '2', label: '2', image: undefined },
    ]);
    expect(buildCustomScaleFieldOptions([{ label: 'Enige stap' }])).toEqual([
      { value: '1', label: 'Enige stap', image: undefined },
      { value: '2', label: '2', image: undefined },
    ]);
  });
});
