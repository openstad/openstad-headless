import { describe, expect, it } from 'vitest';

const { flattenSubmission, fieldKeyOf } = require('./flatten-submission');

const FORM = [
  { fieldKey: 'name', title: 'Naam', questionType: '' },
  { fieldKey: 'choices', title: 'Kies', questionType: 'multiplechoice' },
  { key: 'legacyKeyOnly', title: 'Legacy' }, // no fieldKey — falls back to key
];

describe('fieldKeyOf', () => {
  it('prefers fieldKey over key', () => {
    expect(fieldKeyOf({ key: 'a', fieldKey: 'b' })).toBe('b');
  });
  it('falls back to key when fieldKey is absent', () => {
    expect(fieldKeyOf({ key: 'a' })).toBe('a');
  });
});

describe('flattenSubmission', () => {
  it('flattens opted-in fields to field_<key>, primitive as-is', () => {
    const out = flattenSubmission({ name: 'Jan', choices: ['a', 'b'] }, FORM, [
      'name',
    ]);
    expect(out).toEqual({ field_name: 'Jan' });
  });

  it('serializes an array value (multi-choice) to a JSON string', () => {
    const out = flattenSubmission({ name: 'Jan', choices: ['a', 'b'] }, FORM, [
      'name',
      'choices',
    ]);
    expect(out.field_choices).toBe('["a","b"]');
  });

  it('missing value for an opted-in field → null (consistent schema)', () => {
    const out = flattenSubmission({}, FORM, ['name']);
    expect(out).toEqual({ field_name: null });
  });

  it('a field not opted in is omitted entirely (PII-by-default)', () => {
    const out = flattenSubmission({ name: 'Jan' }, FORM, []);
    expect(out).toEqual({});
  });

  it('excludes control fields (confirmationUser etc.) even if opted in by key', () => {
    const formWithControl = [
      ...FORM,
      { fieldKey: 'confirmationUser', title: 'Confirm' },
    ];
    const out = flattenSubmission({ confirmationUser: true }, formWithControl, [
      'confirmationUser',
    ]);
    expect(out).toEqual({});
  });

  it('orphan submittedData keys (not in the form definition) are ignored', () => {
    const out = flattenSubmission(
      { name: 'Jan', ghostField: 'leftover from an old form version' },
      FORM,
      ['name', 'ghostField']
    );
    expect(out).toEqual({ field_name: 'Jan' });
  });

  it('falls back to `key` when fieldKey is absent on the form item', () => {
    const out = flattenSubmission({ legacyKeyOnly: 'value' }, FORM, [
      'legacyKeyOnly',
    ]);
    expect(out).toEqual({ field_legacyKeyOnly: 'value' });
  });

  it('handles missing/empty submittedData and formItems gracefully', () => {
    expect(flattenSubmission(null, FORM, ['name'])).toEqual({
      field_name: null,
    });
    expect(flattenSubmission({ name: 'Jan' }, null, ['name'])).toEqual({});
    expect(flattenSubmission({ name: 'Jan' }, FORM, null)).toEqual({});
  });

  it('accepts a JSON string blob (#441 ChoicesGuideResult.result in plain mode)', () => {
    const out = flattenSubmission(JSON.stringify({ name: 'Jan' }), FORM, [
      'name',
    ]);
    expect(out).toEqual({ field_name: 'Jan' });
  });

  it('an unparseable string blob is treated as empty (never throws)', () => {
    const out = flattenSubmission('not json', FORM, ['name']);
    expect(out).toEqual({ field_name: null });
  });

  it('applies a custom column prefix (#441 answer_<key>)', () => {
    const out = flattenSubmission({ name: 'Jan' }, FORM, ['name'], 'answer_');
    expect(out).toEqual({ answer_name: 'Jan' });
  });
});
