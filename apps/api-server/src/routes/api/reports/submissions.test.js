import { describe, expect, it } from 'vitest';

// The route module requires ../../../db at load time for the Widget include.
// Sequelize does not connect at require time (only .define runs), so no mock is
// needed — same as submissions-fields.test.js.
const submissions = require('./submissions');
const { ReportingFilterError } = require('../../../lib/reporting/filters');

const { baseWhere, extraColumns, unionFormItems } = submissions;

function widgetRow(id, items, submittedData) {
  return {
    id,
    widget: { id: 10, type: 'enquete', config: { items } },
    submittedData,
  };
}

function req(query = {}, formFields = []) {
  return {
    query,
    project: { id: 5, config: { dataScope: { submissions: { formFields } } } },
  };
}

describe('?widgetId= filtering', () => {
  it('adds no constraint when the param is absent or empty', () => {
    expect(baseWhere(req({}))).toEqual({});
    expect(baseWhere(req({ widgetId: '' }))).toEqual({});
  });

  it('narrows to one widget for a numeric id', () => {
    expect(baseWhere(req({ widgetId: '42' }))).toEqual({ widgetId: '42' });
  });

  // A bare truthiness check let all of these through to Sequelize; an array in
  // particular widens the filter to several forms, defeating the single-form
  // schema the param promises.
  it.each([
    [['1', '2'], 'repeated param, parsed into an array'],
    [{ a: '1' }, 'bracketed param, parsed into an object'],
    ['abc', 'not numeric'],
    ['1 OR 1=1', 'not numeric'],
    ['-1', 'not numeric'],
  ])('rejects %s (%s) with a 400-shaped error', (value) => {
    let err;
    try {
      baseWhere(req({ widgetId: value }));
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ReportingFilterError);
    expect(err.code).toBe('invalid_widget_id');
    expect(err.param).toBe('widgetId');
  });
});

describe('unionFormItems', () => {
  it('unions the form items across the page, de-duplicated, in first-seen order', () => {
    const rows = [
      widgetRow(1, [{ fieldKey: 'name' }, { fieldKey: 'age' }], {}),
      widgetRow(2, [{ fieldKey: 'age' }, { fieldKey: 'city' }], {}),
    ];
    expect(unionFormItems(rows).map((i) => i.fieldKey)).toEqual([
      'name',
      'age',
      'city',
    ]);
  });

  it('ignores rows without a widget config and items without a field key', () => {
    const rows = [
      { id: 1, submittedData: {} },
      { id: 2, widget: { config: {} }, submittedData: {} },
      widgetRow(3, [{ title: 'no key' }, { fieldKey: 'name' }], {}),
    ];
    expect(unionFormItems(rows).map((i) => i.fieldKey)).toEqual(['name']);
  });
});

describe('extraColumns', () => {
  const rows = [
    widgetRow(1, [{ fieldKey: 'name' }], { name: 'Ada' }),
    widgetRow(2, [{ fieldKey: 'city' }], { city: 'Utrecht' }),
  ];

  it('gives every row the page-wide column set, null where its own form lacks the key', () => {
    const r = req({}, ['name', 'city']);
    expect(extraColumns(rows[0], r, rows)).toEqual({
      field_name: 'Ada',
      field_city: null,
    });
    expect(extraColumns(rows[1], r, rows)).toEqual({
      field_name: null,
      field_city: 'Utrecht',
    });
  });

  it('only emits fields the admin opted in', () => {
    expect(extraColumns(rows[0], req({}, ['name']), rows)).toEqual({
      field_name: 'Ada',
    });
    expect(extraColumns(rows[0], req({}, []), rows)).toEqual({});
  });

  // extraColumns runs once per row, so deriving the union inside it would
  // re-scan the whole page for every row.
  it('derives the page context once per request, not once per row', () => {
    const r = req({}, ['name', 'city']);
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

    // The first row pays for the whole page; every later row re-uses it, so the
    // work does not scale with the number of rows serialized.
    expect(afterFirstRow).toBeGreaterThan(0);
    expect(spied.reads).toBe(afterFirstRow);
  });
});
