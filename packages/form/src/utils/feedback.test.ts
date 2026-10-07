import { describe, expect, test } from 'vitest';

import { FeedbackField, evaluateFeedback, isGraded } from './feedback';

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

describe('evaluateFeedback: grading decoupled from feedbackMode', () => {
  test('grades on isCorrect markings even when feedbackMode is none', () => {
    const field: FeedbackField = {
      type: 'radiobox',
      feedbackMode: 'none',
      feedbackCorrect: 'Well done!',
      feedbackIncorrect: 'Try again.',
      choices: [{ value: 'a', isCorrect: true }, { value: 'b' }],
    };

    const correct = evaluateFeedback(field, 'a');
    expect(correct.isFullyCorrect).toBe(true);
    expect(correct.optionStates).toEqual({ a: 'correct' });
    expect(correct.textToShow).toEqual(['Well done!']);

    const wrong = evaluateFeedback(field, 'b');
    expect(wrong.isFullyCorrect).toBe(false);
    expect(wrong.optionStates).toEqual({ b: 'incorrect', a: 'missed' });
    expect(wrong.textToShow).toEqual(['Try again.']);
  });

  test('no isCorrect markings means not graded (default fout, no quiz)', () => {
    const field: FeedbackField = {
      type: 'checkbox',
      feedbackMode: 'none',
      choices: [{ value: 'a' }, { value: 'b' }],
    };
    expect(isGraded(field)).toBe(false);
    const result = evaluateFeedback(field, JSON.stringify(['a']));
    expect(result.optionStates).toEqual({});
    expect(result.isFullyCorrect).toBe(false);
    expect(result.textToShow).toEqual([]);
  });

  test('grading result and per-answer feedback combine', () => {
    const field: FeedbackField = {
      type: 'checkbox',
      feedbackMode: 'perAnswer',
      feedbackIncorrect: 'Not quite.',
      choices: [
        { value: 'a', isCorrect: true, feedbackText: 'about a' },
        { value: 'b', feedbackText: 'about b' },
      ],
    };
    const result = evaluateFeedback(field, JSON.stringify(['b']));
    expect(result.isFullyCorrect).toBe(false);
    expect(result.optionStates).toEqual({ b: 'incorrect', a: 'missed' });
    expect(result.textToShow).toEqual(['Not quite.', 'about b']);
  });

  test('isGraded reflects presence of a correct choice', () => {
    expect(
      isGraded({ choices: [{ value: 'a' }, { value: 'b', isCorrect: true }] })
    ).toBe(true);
    expect(isGraded({ choices: [{ value: 'a' }] })).toBe(false);
    expect(isGraded({})).toBe(false);
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
