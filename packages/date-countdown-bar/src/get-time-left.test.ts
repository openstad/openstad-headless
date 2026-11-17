import { parseISO } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { getTimeLeft } from './get-time-left';

process.env.TZ = 'Europe/Amsterdam';

describe('getTimeLeft', () => {
  it('runs in the Europe/Amsterdam zone', () => {
    expect(new Date('2026-11-13T23:00:00.000Z').getTimezoneOffset()).toBe(-60);
  });

  it('(a) does not lose a day in the hour after midnight before the winter-time change', () => {
    const now = new Date('2026-10-02T00:15:00+02:00');
    const target = new Date('2026-11-13T23:00:00.000Z');
    expect(getTimeLeft(now, target)).toEqual({
      days: 43,
      hours: 0,
      minutes: 45,
    });
  });

  it('(b) counts down to a set hour', () => {
    const now = new Date('2026-10-05T12:30:00+02:00');
    const target = new Date('2026-11-14T14:00:00+01:00');
    expect(getTimeLeft(now, target)).toEqual({
      days: 40,
      hours: 2,
      minutes: 30,
    });
  });

  it('(c) returns zeros for a target in the past', () => {
    const now = new Date('2026-10-05T12:00:00+02:00');
    const target = new Date('2026-10-01T12:00:00+02:00');
    expect(getTimeLeft(now, target)).toEqual({ days: 0, hours: 0, minutes: 0 });
  });

  it('(d) returns zeros for an invalid target', () => {
    expect(getTimeLeft(new Date(), parseISO(''))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
    });
  });

  it('(e) shows 1 minute one minute before the target', () => {
    const now = new Date('2026-11-14T13:59:00+01:00');
    const target = new Date('2026-11-14T14:00:00+01:00');
    expect(getTimeLeft(now, target)).toEqual({ days: 0, hours: 0, minutes: 1 });
  });
});
