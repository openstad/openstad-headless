import { describe, expect, it, vi } from 'vitest';

const {
  inferFieldType,
  buildFieldRows,
  resolveSubmissionFields,
} = require('./submissions-fields');
const submissionsFields = require('./submissions-fields');

describe('inferFieldType', () => {
  it('classifies choice questions by questionType', () => {
    expect(inferFieldType({ questionType: 'multiplechoice' })).toBe('choice');
    expect(inferFieldType({ questionType: 'dilemma' })).toBe('choice');
  });

  it('classifies as choice when the item has a non-empty options list', () => {
    expect(inferFieldType({ options: ['a', 'b'] })).toBe('choice');
  });

  it('an empty options list does not force choice', () => {
    expect(inferFieldType({ options: [] })).toBe('text');
  });

  it('classifies date/number via questionType or variant hints', () => {
    expect(inferFieldType({ questionType: 'date' })).toBe('date');
    expect(inferFieldType({ variant: 'date picker' })).toBe('date');
    expect(inferFieldType({ questionType: 'number' })).toBe('number');
    expect(inferFieldType({ variant: 'number input' })).toBe('number');
  });

  it('defaults to text', () => {
    expect(inferFieldType({ variant: 'text input' })).toBe('text');
    expect(inferFieldType({})).toBe('text');
  });
});

describe('buildFieldRows', () => {
  const items = [
    { fieldKey: 'name', title: 'Name', variant: 'text input' },
    { fieldKey: 'age', title: 'Age', questionType: 'number' },
    { fieldKey: 'confirmationUser' }, // control field, never a form field
  ];

  it('only includes fields the admin has opted in (per-field enabled-gating)', () => {
    const rows = buildFieldRows(items, ['name']);
    expect(rows).toEqual([{ name: 'field_name', label: 'Name', type: 'text' }]);
  });

  it('includes multiple opted-in fields, in item order', () => {
    const rows = buildFieldRows(items, ['name', 'age']);
    expect(rows).toEqual([
      { name: 'field_name', label: 'Name', type: 'text' },
      { name: 'field_age', label: 'Age', type: 'number' },
    ]);
  });

  it('excludes everything when no fields are opted in', () => {
    expect(buildFieldRows(items, [])).toEqual([]);
    expect(buildFieldRows(items, undefined)).toEqual([]);
  });

  it('never exposes control fields even if opted in by key', () => {
    expect(buildFieldRows(items, ['confirmationUser'])).toEqual([]);
  });

  it('skips items with no resolvable field key', () => {
    expect(buildFieldRows([{ title: 'no key' }], ['whatever'])).toEqual([]);
  });

  it('deduplicates repeated field keys, keeping the first occurrence', () => {
    const dupItems = [
      { fieldKey: 'name', title: 'First' },
      { fieldKey: 'name', title: 'Second' },
    ];
    expect(buildFieldRows(dupItems, ['name'])).toEqual([
      { name: 'field_name', label: 'First', type: 'text' },
    ]);
  });

  it('falls back to the key as the label when title is absent', () => {
    expect(buildFieldRows([{ fieldKey: 'name' }], ['name'])).toEqual([
      { name: 'field_name', label: 'name', type: 'text' },
    ]);
  });
});

describe('resolveSubmissionFields', () => {
  it('returns notFound:true when no widget matches (404 case)', async () => {
    const stubDb = { Widget: { findOne: vi.fn().mockResolvedValue(null) } };
    const result = await resolveSubmissionFields({
      db: stubDb,
      widgetId: 999,
      projectId: 1,
      enabledFormFields: [],
    });
    expect(result).toEqual({ notFound: true });
    expect(stubDb.Widget.findOne).toHaveBeenCalledWith({
      where: { id: 999, projectId: 1 },
      attributes: ['id', 'config'],
    });
  });

  it('returns the built field rows for a found widget', async () => {
    const stubDb = {
      Widget: {
        findOne: vi.fn().mockResolvedValue({
          id: 5,
          config: { items: [{ fieldKey: 'name', title: 'Name' }] },
        }),
      },
    };
    const result = await resolveSubmissionFields({
      db: stubDb,
      widgetId: 5,
      projectId: 1,
      enabledFormFields: ['name'],
    });
    expect(result).toEqual({
      fields: [{ name: 'field_name', label: 'Name', type: 'text' }],
    });
  });

  it('handles a widget with no config.items', async () => {
    const stubDb = {
      Widget: { findOne: vi.fn().mockResolvedValue({ id: 5, config: {} }) },
    };
    const result = await resolveSubmissionFields({
      db: stubDb,
      widgetId: 5,
      projectId: 1,
      enabledFormFields: ['name'],
    });
    expect(result).toEqual({ fields: [] });
  });
});

describe('submissionsFields handler', () => {
  function makeRes() {
    const res = {
      _status: null,
      _body: null,
      _headers: {},
      status(code) {
        this._status = code;
        return this;
      },
      set(key, value) {
        this._headers[key] = value;
        return this;
      },
      json(body) {
        this._body = body;
        return this;
      },
    };
    return res;
  }

  it('returns 400 missing_widget_id as problem+json when ?widgetId= is absent, without ever touching the DB', async () => {
    const req = { query: {}, project: { id: 1 } };
    const res = makeRes();
    const next = vi.fn();

    await submissionsFields(req, res, next);

    expect(res._status).toBe(400);
    expect(res._headers['Content-Type']).toBe('application/problem+json');
    expect(res._body.code).toBe('missing_widget_id');
    expect(res._body.status).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 404 widget_not_found as problem+json for a widget outside the project', async () => {
    // The handler passes the module-level db into resolveSubmissionFields;
    // stub the one query so this stays DB-free like the test above.
    const db = require('../../../db');
    const findOne = vi.spyOn(db.Widget, 'findOne').mockResolvedValue(null);

    try {
      const req = { query: { widgetId: '99' }, project: { id: 1 } };
      const res = makeRes();
      const next = vi.fn();

      await submissionsFields(req, res, next);

      expect(res._status).toBe(404);
      expect(res._headers['Content-Type']).toBe('application/problem+json');
      expect(res._body.code).toBe('widget_not_found');
      expect(next).not.toHaveBeenCalled();
    } finally {
      findOne.mockRestore();
    }
  });
});
