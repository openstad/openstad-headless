import { describe, expect, it } from 'vitest';

import {
  TimelineDateInput,
  formatTimelineDate,
  fromTimelineDateInput,
  getDatePrecision,
  getIsoWeek,
  getTimelineDateTime,
  isoWeekToDate,
  toTimelineDateInput,
} from './timeline-date-precision';

const input = (patch: Partial<TimelineDateInput>): TimelineDateInput => ({
  precision: 'day',
  date: '',
  week: '',
  month: '1',
  quarter: '1',
  year: '2027',
  label: '',
  ...patch,
});

describe('getDatePrecision', () => {
  it('defaults to day for missing or unknown values', () => {
    expect(getDatePrecision({})).toBe('day');
    expect(getDatePrecision({ datePrecision: 'century' })).toBe('day');
    expect(getDatePrecision({ datePrecision: 'quarter' })).toBe('quarter');
  });
});

describe('ISO weeks', () => {
  it('finds the week of a date, also around new year', () => {
    expect(getIsoWeek('2026-11-09')).toEqual({ year: 2026, week: 46 });
    expect(getIsoWeek('2027-01-03')).toEqual({ year: 2026, week: 53 });
    expect(getIsoWeek('2024-12-30')).toEqual({ year: 2025, week: 1 });
    expect(getIsoWeek('not-a-date')).toBeNull();
  });

  it('returns the Monday of a week', () => {
    expect(isoWeekToDate(2026, 46)).toBe('2026-11-09');
    expect(isoWeekToDate(2025, 1)).toBe('2024-12-30');
    expect(isoWeekToDate(2026, 53)).toBe('2026-12-28');
  });

  it('returns an empty string for a week that does not exist', () => {
    expect(isoWeekToDate(2027, 53)).toBe('');
    expect(isoWeekToDate(2027, 0)).toBe('');
  });
});

describe('formatTimelineDate', () => {
  it('formats each precision', () => {
    expect(formatTimelineDate({ activeFrom: '2026-09-28' })).toBe(
      '28 september 2026'
    );
    expect(
      formatTimelineDate({ activeFrom: '2026-11-09', datePrecision: 'week' })
    ).toBe('Week 46, 2026');
    expect(
      formatTimelineDate({ activeFrom: '2027-05-01', datePrecision: 'month' })
    ).toBe('Mei 2027');
    expect(
      formatTimelineDate({ activeFrom: '2027-07-01', datePrecision: 'quarter' })
    ).toBe('Q3 2027');
    expect(
      formatTimelineDate({ activeFrom: '2027-01-01', datePrecision: 'year' })
    ).toBe('2027');
  });

  it('shows the free text, or the date when the text is missing', () => {
    const item = { activeFrom: '2027-07-01', datePrecision: 'text' };
    expect(formatTimelineDate({ ...item, dateLabel: 'medio 2027' })).toBe(
      'medio 2027'
    );
    expect(formatTimelineDate(item)).toBe('1 juli 2027');
  });

  it('returns an empty string without a valid date', () => {
    expect(formatTimelineDate({})).toBe('');
    expect(formatTimelineDate({ activeFrom: '2026-10-03T10:00:00Z' })).toBe('');
  });
});

describe('getTimelineDateTime', () => {
  it('returns a valid datetime value where one exists', () => {
    expect(getTimelineDateTime({ activeFrom: '2026-09-28' })).toBe(
      '2026-09-28'
    );
    expect(
      getTimelineDateTime({ activeFrom: '2026-11-09', datePrecision: 'week' })
    ).toBe('2026-W46');
    expect(
      getTimelineDateTime({ activeFrom: '2027-05-01', datePrecision: 'month' })
    ).toBe('2027-05');
    expect(
      getTimelineDateTime({ activeFrom: '2027-01-01', datePrecision: 'year' })
    ).toBe('2027');
  });

  it('returns undefined for quarters, free text and missing dates', () => {
    expect(
      getTimelineDateTime({
        activeFrom: '2027-07-01',
        datePrecision: 'quarter',
      })
    ).toBeUndefined();
    expect(
      getTimelineDateTime({ activeFrom: '2027-07-01', datePrecision: 'text' })
    ).toBeUndefined();
    expect(getTimelineDateTime({})).toBeUndefined();
  });
});

describe('toTimelineDateInput', () => {
  it('derives every part from the start date', () => {
    expect(
      toTimelineDateInput({ activeFrom: '2027-08-16', datePrecision: 'week' })
    ).toEqual({
      precision: 'week',
      date: '2027-08-16',
      week: '33',
      month: '8',
      quarter: '3',
      year: '2027',
      label: '',
    });
  });

  it('uses the week-year for weeks that start in the previous year', () => {
    expect(
      toTimelineDateInput({ activeFrom: '2024-12-30', datePrecision: 'week' })
        .year
    ).toBe('2025');
  });

  it('starts a new item as a day in the current year', () => {
    expect(toTimelineDateInput({}, new Date(2026, 9, 2))).toEqual({
      precision: 'day',
      date: '',
      week: '',
      month: '1',
      quarter: '1',
      year: '2026',
      label: '',
    });
  });
});

describe('fromTimelineDateInput', () => {
  it('stores an exact day without a precision', () => {
    expect(fromTimelineDateInput(input({ date: '2026-09-28' }))).toEqual({
      ok: true,
      fields: { activeFrom: '2026-09-28' },
    });
  });

  it('stores the first day of a period', () => {
    const fields = (patch: Partial<TimelineDateInput>) => {
      const result = fromTimelineDateInput(input(patch));
      return result.ok ? result.fields : result.error;
    };
    expect(fields({ precision: 'week', week: '46', year: '2026' })).toEqual({
      activeFrom: '2026-11-09',
      datePrecision: 'week',
    });
    expect(fields({ precision: 'month', month: '5' })).toEqual({
      activeFrom: '2027-05-01',
      datePrecision: 'month',
    });
    expect(fields({ precision: 'quarter', quarter: '3' })).toEqual({
      activeFrom: '2027-07-01',
      datePrecision: 'quarter',
    });
    expect(fields({ precision: 'year' })).toEqual({
      activeFrom: '2027-01-01',
      datePrecision: 'year',
    });
  });

  it('stores free text with its expected date', () => {
    expect(
      fromTimelineDateInput(
        input({ precision: 'text', label: ' medio 2027 ', date: '2027-07-01' })
      )
    ).toEqual({
      ok: true,
      fields: {
        activeFrom: '2027-07-01',
        datePrecision: 'text',
        dateLabel: 'medio 2027',
      },
    });
  });

  it('reports what is missing or invalid', () => {
    const error = (patch: Partial<TimelineDateInput>) => {
      const result = fromTimelineDateInput(input(patch));
      return result.ok ? null : result.error;
    };
    expect(error({ date: '' })).toBe('Vul een geldige datum in.');
    expect(error({ date: '2026-02-31' })).toBe('Vul een geldige datum in.');
    expect(error({ precision: 'year', year: 'abc' })).toBe(
      'Vul een geldig jaar in.'
    );
    expect(error({ precision: 'week', week: '54' })).toBe(
      'Vul een weeknummer in van 1 tot en met 53.'
    );
    expect(error({ precision: 'week', week: '53', year: '2027' })).toBe(
      'Week 53 bestaat niet in 2027.'
    );
    expect(error({ precision: 'text', label: '', date: '2027-07-01' })).toBe(
      'Vul een tekst in.'
    );
    expect(error({ precision: 'text', label: 'medio 2027' })).toBe(
      'Vul een verwachte datum in.'
    );
    expect(
      error({ precision: 'text', label: 'x'.repeat(61), date: '2027-07-01' })
    ).toBe('De tekst mag maximaal 60 tekens lang zijn.');
  });
});
