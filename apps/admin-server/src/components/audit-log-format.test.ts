import { describe, expect, it } from 'vitest';

import { fieldLabel, formatFieldValue, humanizeKey } from './audit-log-format';

describe('humanizeKey', () => {
  it('splits camelCase into a sentence', () => {
    expect(humanizeKey('displayTagFilters')).toBe('Display tag filters');
  });

  it('splits on underscores and digits before capitals', () => {
    expect(humanizeKey('max_items2Show')).toBe('Max items2 show');
  });

  it('collapses repeated spaces', () => {
    expect(humanizeKey('a__b')).toBe('A b');
  });

  it('returns the key itself when nothing readable is left', () => {
    expect(humanizeKey('')).toBe('');
    expect(humanizeKey('___')).toBe('___');
  });
});

describe('fieldLabel', () => {
  it('prefers the label of the widget type over the general label', () => {
    expect(fieldLabel('autoApply', 'resourceoverview')).toBe(
      'Automatisch toepassen van de filters wanneer een filter wijzigt'
    );
  });

  it('uses the general label when the widget type has none for the key', () => {
    expect(fieldLabel('placeholder', 'agenda')).toBe('Placeholder');
  });

  it('uses the general label without a widget type', () => {
    expect(fieldLabel('autoApply')).toBe('Filters automatisch toepassen');
  });

  it('falls back to a humanized key for unknown widget types and keys', () => {
    expect(fieldLabel('someNewSetting', 'unknownwidget')).toBe(
      'Some new setting'
    );
  });
});

describe('formatFieldValue', () => {
  it('translates known values of a field', () => {
    expect(formatFieldValue('onlyForModerator', true)).toBe('Alleen admin');
    expect(formatFieldValue('onlyForModerator', false)).toBe('Iedereen');
    expect(formatFieldValue('variant', 'textarea')).toBe('Tekstvak');
  });

  it('formats values without a translation like any other value', () => {
    expect(formatFieldValue('variant', 'onbekend')).toBe('onbekend');
    expect(formatFieldValue('title', true)).toBe('Ja');
    expect(formatFieldValue('title', '<b>Kaart</b>')).toBe('Kaart');
  });
});
