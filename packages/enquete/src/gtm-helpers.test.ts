import { describe, expect, test } from 'vitest';

import {
  EXPLANATION_SUFFIX,
  buildQuestionIdMap,
  parseInteractionKey,
  resolveQuestionId,
} from './gtm-helpers';

describe('buildQuestionIdMap', () => {
  test('numbers real questions positionally (qid1..qidN)', () => {
    const map = buildQuestionIdMap([
      { fieldKey: 'who are you', questionType: 'multiplechoice' },
      { fieldKey: 'age', questionType: 'open' },
    ]);
    expect(map).toEqual({ 'who are you': 'qid1', age: 'qid2' });
  });

  test('skips pagination and info blocks without counting them', () => {
    const map = buildQuestionIdMap([
      { fieldKey: 'q1', questionType: 'open' },
      { fieldKey: 'pag1', questionType: 'pagination' },
      { fieldKey: 'info1', questionType: 'none' },
      { fieldKey: 'q2', questionType: 'sort' },
    ]);
    expect(map).toEqual({ q1: 'qid1', q2: 'qid2' });
  });

  test('ignores items without a fieldKey', () => {
    const map = buildQuestionIdMap([
      { questionType: 'open' },
      { fieldKey: 'q1', questionType: 'open' },
    ]);
    expect(map).toEqual({ q1: 'qid1' });
  });

  test('returns an empty map for missing or invalid input', () => {
    expect(buildQuestionIdMap(undefined)).toEqual({});
    expect(buildQuestionIdMap([])).toEqual({});
  });
});

describe('parseInteractionKey', () => {
  test('recognizes a regular fieldKey', () => {
    expect(parseInteractionKey('age')).toEqual({
      baseKey: 'age',
      isExplanation: false,
    });
  });

  test('recognizes an explanation suffix and strips it', () => {
    expect(parseInteractionKey(`age${EXPLANATION_SUFFIX}`)).toEqual({
      baseKey: 'age',
      isExplanation: true,
    });
  });
});

describe('resolveQuestionId', () => {
  const map = { q1: 'qid1', q6: 'qid6' };

  test('maps a base question to qidN', () => {
    expect(resolveQuestionId(map, 'q1')).toEqual({
      baseKey: 'q1',
      questionId: 'qid1',
      isExplanation: false,
    });
  });

  test('maps explanation to qidNexplanation', () => {
    expect(resolveQuestionId(map, `q6${EXPLANATION_SUFFIX}`)).toEqual({
      baseKey: 'q6',
      questionId: 'qid6explanation',
      isExplanation: true,
    });
  });

  test('returns questionId null for an unknown question', () => {
    expect(resolveQuestionId(map, 'unknown')).toEqual({
      baseKey: 'unknown',
      questionId: null,
      isExplanation: false,
    });
  });
});
