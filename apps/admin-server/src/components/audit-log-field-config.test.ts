import { describe, expect, it } from 'vitest';

import {
  getItemDisplayFields,
  isHiddenItemField,
  isInternalField,
} from './audit-log-field-config';

describe('isInternalField', () => {
  it('marks system fields as internal', () => {
    for (const key of [
      'id',
      'trigger',
      'uuid',
      'widgetId',
      'projectId',
      'datalayer',
    ]) {
      expect(isInternalField(key)).toBe(true);
    }
  });

  it('does not mark content fields as internal', () => {
    expect(isInternalField('title')).toBe(false);
    expect(isInternalField('key')).toBe(false);
  });
});

describe('isHiddenItemField', () => {
  it('hides internal fields and item helper fields', () => {
    expect(isHiddenItemField('uuid')).toBe(true);
    expect(isHiddenItemField('key_b')).toBe(true);
    expect(isHiddenItemField('imageAlt')).toBe(true);
  });

  it('shows content fields', () => {
    expect(isHiddenItemField('title')).toBe(false);
  });
});

describe('getItemDisplayFields', () => {
  it('returns only the fields that should be shown', () => {
    expect(
      getItemDisplayFields({
        id: 1,
        uuid: 'abc',
        trigger: '2',
        key_b: 'b',
        title: 'Vraag',
        fieldKey: 'naam',
      })
    ).toEqual(['title', 'fieldKey']);
  });

  it('returns no fields for non objects', () => {
    expect(getItemDisplayFields(null)).toEqual([]);
    expect(getItemDisplayFields('tekst')).toEqual([]);
  });
});
