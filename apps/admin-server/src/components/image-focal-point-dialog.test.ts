import { describe, expect, it } from 'vitest';

import {
  clampFocalPoint,
  describeFocalPoint,
  focalPointHintAfterCrop,
  movePointByKey,
  pointFromClick,
} from './image-focal-point-dialog';

describe('movePointByKey', () => {
  const p = { x: 50, y: 50 };
  it('moves 1% per arrow key', () => {
    expect(movePointByKey(p, 'ArrowLeft', false)).toEqual({ x: 49, y: 50 });
    expect(movePointByKey(p, 'ArrowRight', false)).toEqual({ x: 51, y: 50 });
    expect(movePointByKey(p, 'ArrowUp', false)).toEqual({ x: 50, y: 49 });
    expect(movePointByKey(p, 'ArrowDown', false)).toEqual({ x: 50, y: 51 });
  });
  it('moves 10% with Shift', () => {
    expect(movePointByKey(p, 'ArrowRight', true)).toEqual({ x: 60, y: 50 });
  });
  it('stops at the edges', () => {
    expect(movePointByKey({ x: 95, y: 3 }, 'ArrowRight', true)).toEqual({
      x: 100,
      y: 3,
    });
    expect(movePointByKey({ x: 95, y: 3 }, 'ArrowUp', true)).toEqual({
      x: 95,
      y: 0,
    });
  });
  it('ignores other keys', () => {
    expect(movePointByKey(p, 'Enter', false)).toBeNull();
    expect(movePointByKey(p, 'a', true)).toBeNull();
  });
});

describe('focalPointHintAfterCrop', () => {
  it('gives a hint when a focal point was cleared', () => {
    expect(focalPointHintAfterCrop({ x: 10, y: 20 })).toMatch(
      /focuspunt is gewist/
    );
  });
  it('stays quiet when there was no focal point', () => {
    expect(focalPointHintAfterCrop(null)).toBeNull();
    expect(focalPointHintAfterCrop(undefined)).toBeNull();
  });
});

describe('describeFocalPoint', () => {
  it('reads the point in plain Dutch', () => {
    expect(describeFocalPoint({ x: 12.4, y: 87.6 })).toBe(
      'Links 12%, boven 88%'
    );
  });
});

const rect = { left: 100, top: 50, width: 200, height: 100 };

describe('pointFromClick', () => {
  it('converts a click to percentages of the image box', () => {
    expect(pointFromClick(200, 100, rect)).toEqual({ x: 50, y: 50 });
    expect(pointFromClick(150, 75, rect)).toEqual({ x: 25, y: 25 });
  });

  it('clamps clicks outside the box', () => {
    expect(pointFromClick(0, 0, rect)).toEqual({ x: 0, y: 0 });
    expect(pointFromClick(999, 999, rect)).toEqual({ x: 100, y: 100 });
  });

  it('falls back to the middle for a zero-size box', () => {
    expect(
      pointFromClick(10, 10, { left: 0, top: 0, width: 0, height: 0 })
    ).toEqual({
      x: 50,
      y: 50,
    });
  });
});

describe('clampFocalPoint', () => {
  it('keeps valid values', () => {
    expect(clampFocalPoint({ x: 10, y: 90 })).toEqual({ x: 10, y: 90 });
  });
  it('clamps out-of-range values', () => {
    expect(clampFocalPoint({ x: -5, y: 120 })).toEqual({ x: 0, y: 100 });
  });
  it('replaces NaN/Infinity with 50', () => {
    expect(clampFocalPoint({ x: NaN, y: Infinity })).toEqual({ x: 50, y: 50 });
  });
});
