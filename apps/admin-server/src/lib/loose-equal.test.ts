import { describe, expect, it } from 'vitest';

import { looseEqual, looseFormEqual } from './loose-equal';

describe('looseEqual (widget draft)', () => {
  it('treats undefined and null as the same "not set"', () => {
    expect(looseEqual(undefined, null)).toBe(true);
    expect(looseEqual({ a: 1 }, { a: 1, b: null })).toBe(true);
    expect(looseEqual({ a: 1 }, { a: 1, b: undefined })).toBe(true);
  });

  it('sees switching off, emptying and clearing a list as a change, also deep inside', () => {
    expect(looseEqual(undefined, false)).toBe(false);
    expect(looseEqual(undefined, '')).toBe(false);
    expect(looseEqual(undefined, [])).toBe(false);
    expect(
      looseEqual(
        [{ id: 1, name: 'Bomen' }],
        [{ id: 1, name: 'Bomen', activeOnInit: false }]
      )
    ).toBe(false);
    expect(looseEqual({}, { likeWidget: { showProgressBar: false } })).toBe(
      false
    );
  });

  it('treats a stored number and the same number typed as text as equal', () => {
    expect(looseEqual(30, '30')).toBe(true);
    expect(looseEqual('-6', -6)).toBe(true);
    expect(looseEqual({ zoom: 10 }, { zoom: '10' })).toBe(true);
  });

  it('still sees real changes', () => {
    expect(looseEqual(30, '31')).toBe(false);
    expect(looseEqual(undefined, true)).toBe(false);
    expect(looseEqual('', 'Lees meer')).toBe(false);
    expect(looseEqual(0, '')).toBe(false);
    expect(looseEqual(0, undefined)).toBe(false);
    expect(looseEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(looseEqual({ a: 'x' }, { a: 'x', b: 'y' })).toBe(false);
    expect(looseEqual([{ id: 1 }], [{ id: 1 }, { id: 2 }])).toBe(false);
  });

  it('does not treat a file or another class instance as empty', () => {
    class Upload {}
    expect(looseEqual(new Upload(), undefined)).toBe(false);
  });

  it('compares dates with their stored ISO text', () => {
    const date = new Date('2031-01-01T00:00:00.000Z');
    expect(looseEqual(date, '2031-01-01T00:00:00.000Z')).toBe(true);
    expect(looseEqual(date, '2031-01-02T00:00:00.000Z')).toBe(false);
  });
});

describe('looseFormEqual (react-hook-form pages)', () => {
  it('treats a value that was never set as equal to an empty field or an off switch', () => {
    expect(looseFormEqual(undefined, false)).toBe(true);
    expect(looseFormEqual(undefined, '')).toBe(true);
    expect(looseFormEqual(null, '')).toBe(true);
    expect(looseFormEqual(undefined, [])).toBe(true);
    expect(looseFormEqual({ a: 1 }, { a: 1, b: false })).toBe(true);
    expect(looseFormEqual({ cta: { show: false } }, {})).toBe(true);
  });

  it('keeps the number and date rules and still sees real changes', () => {
    expect(looseFormEqual(30, '30')).toBe(true);
    expect(looseFormEqual(30, '31')).toBe(false);
    expect(looseFormEqual(undefined, true)).toBe(false);
    expect(looseFormEqual('', 'Lees meer')).toBe(false);
    expect(looseFormEqual(0, '')).toBe(false);
    expect(looseFormEqual({ a: 'x' }, { a: 'x', b: 'y' })).toBe(false);
  });
});
