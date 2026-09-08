import { describe, expect, test } from 'vitest';

import {
  buildRandomizePerPage,
  randomizeFieldsPerPage,
  shuffleWithSeed,
} from './randomize-questions';

type TestField = {
  fieldKey: string;
  type?: string;
};

const question = (fieldKey: string): TestField => ({ fieldKey, type: 'text' });

// Page 1: q1, q2, q3 | Page 2: q4, q5, info, q6
const fields: TestField[] = [
  question('q1'),
  question('q2'),
  question('q3'),
  { fieldKey: 'page2', type: 'pagination' },
  question('q4'),
  question('q5'),
  { fieldKey: 'info', type: 'none' },
  question('q6'),
];

const startPositions = [0, 4];
const endPositions = [3, 8];

const keys = (result: TestField[]) => result.map((field) => field.fieldKey);

const findChangingSeed = (randomizePerPage: boolean[]): number => {
  for (let seed = 1; seed <= 50; seed++) {
    const result = randomizeFieldsPerPage({
      fields,
      startPositions,
      endPositions,
      randomizePerPage,
      seed,
    });
    if (keys(result).join() !== keys(fields).join()) return seed;
  }
  throw new Error('no seed changed the order');
};

describe('shuffleWithSeed', () => {
  test('is deterministic for the same seed', () => {
    const values = ['a', 'b', 'c', 'd', 'e'];
    expect(shuffleWithSeed(values, 42)).toEqual(shuffleWithSeed(values, 42));
  });

  test('keeps every value exactly once', () => {
    const values = ['a', 'b', 'c', 'd', 'e'];
    expect([...shuffleWithSeed(values, 7)].sort()).toEqual([...values].sort());
  });

  test('does not mutate the input', () => {
    const values = ['a', 'b', 'c', 'd', 'e'];
    shuffleWithSeed(values, 7);
    expect(values).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});

describe('randomizeFieldsPerPage', () => {
  test('returns the configured order when no page is randomized', () => {
    const result = randomizeFieldsPerPage({
      fields,
      startPositions,
      endPositions,
      randomizePerPage: [false, false],
      seed: 1234,
    });

    expect(keys(result)).toEqual(keys(fields));
  });

  test('actually changes the order of a randomized page', () => {
    const seed = findChangingSeed([true, false]);
    const result = randomizeFieldsPerPage({
      fields,
      startPositions,
      endPositions,
      randomizePerPage: [true, false],
      seed,
    });

    expect(keys(result)).not.toEqual(keys(fields));
  });

  test('produces the same order for the same seed', () => {
    const input = {
      fields,
      startPositions,
      endPositions,
      randomizePerPage: [true, true],
      seed: 99,
    };

    expect(keys(randomizeFieldsPerPage(input))).toEqual(
      keys(randomizeFieldsPerPage(input))
    );
  });

  test('never moves a question to another page', () => {
    const result = randomizeFieldsPerPage({
      fields,
      startPositions,
      endPositions,
      randomizePerPage: [true, true],
      seed: 2024,
    });

    startPositions.forEach((start, pageIndex) => {
      const end = endPositions[pageIndex];
      expect(keys(result.slice(start, end)).sort()).toEqual(
        keys(fields.slice(start, end)).sort()
      );
    });
  });

  test('keeps the pagination field at its own position', () => {
    const result = randomizeFieldsPerPage({
      fields,
      startPositions,
      endPositions,
      randomizePerPage: [true, true],
      seed: 2024,
    });

    expect(result[3]).toEqual(fields[3]);
    expect(result).toHaveLength(fields.length);
  });

  test('keeps info blocks and video fields pinned', () => {
    const withVideo: TestField[] = [
      question('q1'),
      { fieldKey: 'clip', type: 'video' },
      question('q2'),
      { fieldKey: 'info', type: 'none' },
      question('q3'),
    ];

    const result = randomizeFieldsPerPage({
      fields: withVideo,
      startPositions: [0],
      endPositions: [withVideo.length],
      randomizePerPage: [true],
      seed: 5,
    });

    expect(result[1]).toEqual(withVideo[1]);
    expect(result[3]).toEqual(withVideo[3]);
  });

  test('leaves a page with a single question untouched', () => {
    const singleQuestionPage: TestField[] = [
      question('q1'),
      { fieldKey: 'info', type: 'none' },
    ];

    const result = randomizeFieldsPerPage({
      fields: singleQuestionPage,
      startPositions: [0],
      endPositions: [singleQuestionPage.length],
      randomizePerPage: [true],
      seed: 5,
    });

    expect(keys(result)).toEqual(keys(singleQuestionPage));
  });

  test('does not mutate the given fields array', () => {
    const before = keys(fields);

    randomizeFieldsPerPage({
      fields,
      startPositions,
      endPositions,
      randomizePerPage: [true, true],
      seed: 2024,
    });

    expect(keys(fields)).toEqual(before);
  });
});

type PagedField = {
  fieldKey: string;
  type?: string;
  randomizeQuestions?: boolean;
};

const pagedFields: PagedField[] = [
  { fieldKey: 'q1', type: 'text' },
  { fieldKey: 'q2', type: 'text' },
  { fieldKey: 'pagA', type: 'pagination', randomizeQuestions: true },
  { fieldKey: 'q3', type: 'text' },
  { fieldKey: 'q4', type: 'text' },
  { fieldKey: 'pagB', type: 'pagination', randomizeQuestions: false },
  { fieldKey: 'q5', type: 'text' },
  { fieldKey: 'q6', type: 'text' },
];

const pagedPositions = [2, 5];

describe('buildRandomizePerPage', () => {
  test('maps every page to the pagination field that introduces it', () => {
    expect(
      buildRandomizePerPage({
        fields: pagedFields,
        paginationPositions: pagedPositions,
      })
    ).toEqual([false, true, false]);
  });

  test('yields false for positions that hold no pagination field', () => {
    expect(
      buildRandomizePerPage({
        fields: pagedFields,
        paginationPositions: [0, 99],
      })
    ).toEqual([false, false, false]);
  });

  test('randomizes only the page whose pagination field carries the flag', () => {
    const startPositions = [0, 3, 6];
    const endPositions = [2, 5, 8];
    const randomizePerPage = buildRandomizePerPage({
      fields: pagedFields,
      paginationPositions: pagedPositions,
    });

    let secondPageChanged = false;

    for (let seed = 1; seed <= 50; seed++) {
      const result = randomizeFieldsPerPage({
        fields: pagedFields,
        startPositions,
        endPositions,
        randomizePerPage,
        seed,
      });
      const order = result.map((field) => field.fieldKey);

      expect(order.slice(0, 2)).toEqual(['q1', 'q2']);
      expect(order.slice(6, 8)).toEqual(['q5', 'q6']);

      if (order.slice(3, 5).join() !== 'q3,q4') {
        secondPageChanged = true;
      }
    }

    expect(secondPageChanged).toBe(true);
  });
});
