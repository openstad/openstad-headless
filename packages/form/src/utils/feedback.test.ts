import { describe, expect, test } from 'vitest';

import { FeedbackField, evaluateFeedback } from './feedback';

describe('evaluateFeedback: correctIncorrect radiobox', () => {
  const field: FeedbackField = {
    type: 'radiobox',
    feedbackMode: 'correctIncorrect',
    feedbackCorrect: 'Well done!',
    feedbackIncorrect: 'Try again.',
    choices: [{ value: 'a', isCorrect: true }, { value: 'b' }, { value: 'c' }],
  };

  test('correct option selected', () => {
    const result = evaluateFeedback(field, 'a');
    expect(result.isFullyCorrect).toBe(true);
    expect(result.optionStates).toEqual({ a: 'correct' });
    expect(result.textToShow).toEqual(['Well done!']);
  });

  test('wrong option selected reveals the missed correct answer', () => {
    const result = evaluateFeedback(field, 'b');
    expect(result.isFullyCorrect).toBe(false);
    expect(result.optionStates).toEqual({ b: 'incorrect', a: 'missed' });
    expect(result.textToShow).toEqual(['Try again.']);
  });
});

describe('evaluateFeedback: correctIncorrect checkbox', () => {
  const field: FeedbackField = {
    type: 'checkbox',
    feedbackMode: 'correctIncorrect',
    feedbackCorrect: 'Correct!',
    feedbackIncorrect: 'Incorrect.',
    choices: [
      { value: 'a', isCorrect: true },
      { value: 'b', isCorrect: true },
      { value: 'c' },
    ],
  };

  test('all correct and none wrong', () => {
    const result = evaluateFeedback(field, JSON.stringify(['a', 'b']));
    expect(result.isFullyCorrect).toBe(true);
    expect(result.optionStates).toEqual({ a: 'correct', b: 'correct' });
    expect(result.textToShow).toEqual(['Correct!']);
  });

  test('missing one correct marks the unselected correct as missed', () => {
    const result = evaluateFeedback(field, JSON.stringify(['a']));
    expect(result.isFullyCorrect).toBe(false);
    expect(result.optionStates).toEqual({ a: 'correct', b: 'missed' });
    expect(result.textToShow).toEqual(['Incorrect.']);
  });

  test('one wrong included', () => {
    const result = evaluateFeedback(field, JSON.stringify(['a', 'b', 'c']));
    expect(result.isFullyCorrect).toBe(false);
    expect(result.optionStates).toEqual({
      a: 'correct',
      b: 'correct',
      c: 'incorrect',
    });
    expect(result.textToShow).toEqual(['Incorrect.']);
  });
});

describe('evaluateFeedback: perAnswer', () => {
  test('checkbox: two selected returns their feedbackText in choices order', () => {
    const field: FeedbackField = {
      type: 'checkbox',
      feedbackMode: 'perAnswer',
      choices: [
        { value: 'a', feedbackText: 'about a' },
        { value: 'b', feedbackText: 'about b' },
        { value: 'c', feedbackText: 'about c' },
      ],
    };
    const result = evaluateFeedback(field, JSON.stringify(['c', 'a']));
    expect(result.optionStates).toEqual({});
    expect(result.textToShow).toEqual(['about a', 'about c']);
    expect(result.isFullyCorrect).toBe(false);
  });

  test('tickmark-slider: rawValue "3" returns scaleFeedback[2]', () => {
    const field: FeedbackField = {
      type: 'tickmark-slider',
      feedbackMode: 'perAnswer',
      scaleFeedback: ['one', 'two', 'three', 'four'],
    };
    const result = evaluateFeedback(field, '3');
    expect(result.textToShow).toEqual(['three']);
    expect(result.optionStates).toEqual({});
  });
});

describe('evaluateFeedback: static', () => {
  test('returns feedbackText', () => {
    const field: FeedbackField = {
      type: 'radiobox',
      feedbackMode: 'static',
      feedbackText: 'Static message',
    };
    const result = evaluateFeedback(field, 'a');
    expect(result.textToShow).toEqual(['Static message']);
    expect(result.isFullyCorrect).toBe(false);
    expect(result.optionStates).toEqual({});
  });
});

describe('evaluateFeedback: none / empty', () => {
  test('mode none returns empty result', () => {
    const field: FeedbackField = { type: 'radiobox', feedbackMode: 'none' };
    expect(evaluateFeedback(field, 'a')).toEqual({
      isFullyCorrect: false,
      textToShow: [],
      optionStates: {},
    });
  });

  test('undefined mode returns empty result', () => {
    const field: FeedbackField = { type: 'radiobox' };
    expect(evaluateFeedback(field, 'a')).toEqual({
      isFullyCorrect: false,
      textToShow: [],
      optionStates: {},
    });
  });

  test('empty value returns empty result for correctIncorrect', () => {
    const field: FeedbackField = {
      type: 'radiobox',
      feedbackMode: 'correctIncorrect',
      feedbackCorrect: 'yes',
      feedbackIncorrect: 'no',
      choices: [{ value: 'a', isCorrect: true }],
    };
    expect(evaluateFeedback(field, '')).toEqual({
      isFullyCorrect: false,
      textToShow: [],
      optionStates: {},
    });
  });
});
