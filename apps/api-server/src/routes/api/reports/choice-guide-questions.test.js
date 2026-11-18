import { describe, expect, it } from 'vitest';

const { buildQuestionRows } = require('./choice-guide-questions');

function makeWidget(id, items) {
  return { id, config: { items } };
}

describe('buildQuestionRows', () => {
  it("flattens items from all of a project's choiceguide widgets, seqnr = array index", () => {
    const rows = buildQuestionRows([
      makeWidget(5, [
        { fieldKey: 'q1', title: 'Question 1', type: 'input' },
        { fieldKey: 'q2', title: 'Question 2', type: 'multiple-choice' },
      ]),
    ]);

    expect(rows).toEqual([
      {
        id: '5:q1',
        widgetId: 5,
        fieldKey: 'q1',
        title: 'Question 1',
        type: 'input',
        seqnr: 0,
      },
      {
        id: '5:q2',
        widgetId: 5,
        fieldKey: 'q2',
        title: 'Question 2',
        type: 'multiple-choice',
        seqnr: 1,
      },
    ]);
  });

  it('flattens across multiple guide widgets, seqnr resets per widget', () => {
    const rows = buildQuestionRows([
      makeWidget(5, [{ fieldKey: 'q1', title: 'Q1' }]),
      makeWidget(6, [{ fieldKey: 'q1', title: 'Other guide Q1' }]),
    ]);
    expect(rows.map((r) => r.id)).toEqual(['5:q1', '6:q1']);
    expect(rows.map((r) => r.seqnr)).toEqual([0, 0]);
  });

  it('falls back to `key` when fieldKey is absent, and to the key as title when title is absent', () => {
    const rows = buildQuestionRows([makeWidget(5, [{ key: 'legacy' }])]);
    expect(rows).toEqual([
      {
        id: '5:legacy',
        widgetId: 5,
        fieldKey: 'legacy',
        title: 'legacy',
        type: null,
        seqnr: 0,
      },
    ]);
  });

  it('items without a resolvable fieldKey/key are skipped', () => {
    expect(buildQuestionRows([makeWidget(5, [{ title: 'no key' }])])).toEqual(
      []
    );
  });

  it('a widget with no config.items yields no rows', () => {
    expect(buildQuestionRows([{ id: 5, config: {} }])).toEqual([]);
  });

  it('handles an empty/missing widget list', () => {
    expect(buildQuestionRows([])).toEqual([]);
    expect(buildQuestionRows(undefined)).toEqual([]);
  });
});
