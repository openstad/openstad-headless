import { describe, expect, it } from 'vitest';

// The route module requires ../../../db at load time for the Widget include.
// Sequelize does not connect at require time (only .define runs), so no mock is
// needed — same as submissions-fields.test.js.
const choiceGuideResults = require('./choice-guide-results');
const { ReportingFilterError } = require('../../../lib/reporting/filters');

const { baseWhere, extraColumns, unionQuestionItems } = choiceGuideResults;

function resultRow(id, items, result, widgetId = 10) {
  return {
    id,
    widgetId,
    widget: { id: widgetId, type: 'choiceguide', config: { items } },
    result,
  };
}

function req(query = {}, answerFields = []) {
  return {
    query,
    project: {
      id: 5,
      config: { dataScope: { choiceguides: { answerFields } } },
    },
  };
}

describe('answer_<key> projection', () => {
  const rows = [resultRow(1, [{ fieldKey: 'housing' }], { housing: 'yes' })];

  it('prefixes the flattened answer columns with answer_, not field_', () => {
    const out = extraColumns(rows[0], req({}, ['housing']), rows);
    expect(out).toEqual({ answer_housing: 'yes' });
    expect(Object.keys(out).every((k) => k.startsWith('answer_'))).toBe(true);
  });

  it('emits nothing when the project opted in to no answer fields', () => {
    expect(extraColumns(rows[0], req({}, []), rows)).toEqual({});
    expect(extraColumns(rows[0], req(), rows)).toEqual({});
  });

  it('emits only the opted-in keys, ignoring answers given but not enabled', () => {
    const row = resultRow(1, [{ fieldKey: 'a' }, { fieldKey: 'b' }], {
      a: '1',
      b: '2',
    });
    expect(extraColumns(row, req({}, ['a']), [row])).toEqual({ answer_a: '1' });
  });
});

describe('question union across widgets on one page', () => {
  const rows = [
    resultRow(1, [{ fieldKey: 'housing' }], { housing: 'yes' }, 10),
    resultRow(2, [{ fieldKey: 'transport' }], { transport: 'bike' }, 11),
  ];

  it('unions the question items, de-duplicated, in first-seen order', () => {
    const dup = [
      resultRow(1, [{ fieldKey: 'a' }, { fieldKey: 'b' }], {}),
      resultRow(2, [{ fieldKey: 'b' }, { fieldKey: 'c' }], {}, 11),
    ];
    expect(unionQuestionItems(dup).map((i) => i.fieldKey)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('ignores rows whose widget did not join and items without a key', () => {
    const rowsNoWidget = [
      { id: 1, result: {} },
      { id: 2, widget: { config: {} }, result: {} },
      resultRow(3, [{ title: 'no key' }, { fieldKey: 'housing' }], {}),
    ];
    expect(unionQuestionItems(rowsNoWidget).map((i) => i.fieldKey)).toEqual([
      'housing',
    ]);
  });

  it('gives every row the page-wide column set, null where its own guide lacks the key', () => {
    const r = req({}, ['housing', 'transport']);
    expect(extraColumns(rows[0], r, rows)).toEqual({
      answer_housing: 'yes',
      answer_transport: null,
    });
    expect(extraColumns(rows[1], r, rows)).toEqual({
      answer_housing: null,
      answer_transport: 'bike',
    });
  });

  // The include is type-scoped and required, so a row without a joined
  // choiceguide widget cannot come back from the query — but the union must not
  // blow up if one ever reaches this code, and it must contribute no items.
  it('tolerates a row with no joined widget without contributing items', () => {
    const stray = { id: 3, widgetId: 0, result: { housing: 'yes' } };
    expect(unionQuestionItems([stray])).toEqual([]);
    expect(
      extraColumns(stray, req({}, ['housing', 'transport']), [...rows, stray])
    ).toEqual({ answer_housing: 'yes', answer_transport: null });
  });

  // extraColumns runs once per row, so deriving the union inside it would
  // re-scan the whole page for every row.
  it('derives the page context once per request, not once per row', () => {
    const r = req({}, ['housing', 'transport']);
    const spied = rows.map((row) => ({
      ...row,
      widget: {
        ...row.widget,
        get config() {
          spied.reads++;
          return row.widget.config;
        },
      },
    }));
    spied.reads = 0;

    extraColumns(spied[0], r, spied);
    const afterFirstRow = spied.reads;
    for (const row of spied.slice(1)) extraColumns(row, r, spied);

    expect(afterFirstRow).toBeGreaterThan(0);
    expect(spied.reads).toBe(afterFirstRow);
  });
});

describe('?widgetId= filtering', () => {
  it('adds no constraint when the param is absent or empty', () => {
    expect(baseWhere(req({}))).toEqual({});
    expect(baseWhere(req({ widgetId: '' }))).toEqual({});
  });

  it('narrows to one guide for a numeric id', () => {
    expect(baseWhere(req({ widgetId: '42' }))).toEqual({ widgetId: '42' });
  });

  it.each([[['1', '2']], [{ a: '1' }], ['abc'], ['-1']])(
    'rejects %s with a 400-shaped error',
    (value) => {
      let err;
      try {
        baseWhere(req({ widgetId: value }));
      } catch (e) {
        err = e;
      }
      expect(err).toBeInstanceOf(ReportingFilterError);
      expect(err.code).toBe('invalid_widget_id');
    }
  );
});
