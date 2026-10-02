import { describe, expect, it } from 'vitest';

import { normalizeTimelineDateFields } from './timeline-date-fields.js';

describe('normalizeTimelineDateFields', () => {
  it('stores nothing for an exact day or a missing precision', () => {
    expect(normalizeTimelineDateFields({})).toEqual({});
    expect(normalizeTimelineDateFields({ datePrecision: 'day' })).toEqual({});
    expect(normalizeTimelineDateFields(null)).toEqual({});
  });

  it('keeps a known precision', () => {
    for (const datePrecision of ['week', 'month', 'quarter', 'year']) {
      expect(normalizeTimelineDateFields({ datePrecision })).toEqual({
        datePrecision,
      });
    }
  });

  it('drops an unknown precision', () => {
    expect(normalizeTimelineDateFields({ datePrecision: 'century' })).toEqual(
      {}
    );
    expect(normalizeTimelineDateFields({ datePrecision: ['week'] })).toEqual(
      {}
    );
  });

  it('only keeps a label for free text', () => {
    expect(
      normalizeTimelineDateFields({
        datePrecision: 'month',
        dateLabel: 'medio 2027',
      })
    ).toEqual({ datePrecision: 'month' });
  });

  it('strips tags from the label and limits its length', () => {
    expect(
      normalizeTimelineDateFields({
        datePrecision: 'text',
        dateLabel: ' <b>medio</b> 2027 ',
      })
    ).toEqual({ datePrecision: 'text', dateLabel: 'medio 2027' });

    const result = normalizeTimelineDateFields({
      datePrecision: 'text',
      dateLabel: 'x'.repeat(200),
    });
    expect(result.dateLabel).toHaveLength(60);
  });

  it('falls back to an exact day when the free text is empty', () => {
    expect(
      normalizeTimelineDateFields({ datePrecision: 'text', dateLabel: '  ' })
    ).toEqual({});
    expect(
      normalizeTimelineDateFields({
        datePrecision: 'text',
        dateLabel: '<script></script>',
      })
    ).toEqual({});
  });
});
