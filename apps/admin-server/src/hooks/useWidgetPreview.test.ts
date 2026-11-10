import { describe, expect, it, vi } from 'vitest';

import {
  resetWidgetPreview,
  subscribeWidgetPreviewReset,
} from './useWidgetPreview';

describe('subscribeWidgetPreviewReset', () => {
  it('calls the listener when its widget is reset', () => {
    const onReset = vi.fn();
    const unsubscribe = subscribeWidgetPreviewReset('12', onReset);

    resetWidgetPreview('12');

    expect(onReset).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('ignores resets of other widgets', () => {
    const onReset = vi.fn();
    const unsubscribe = subscribeWidgetPreviewReset('12', onReset);

    resetWidgetPreview('13');

    expect(onReset).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('matches a numeric reset id with a string widget id', () => {
    const onReset = vi.fn();
    const unsubscribe = subscribeWidgetPreviewReset('12', onReset);

    resetWidgetPreview(12);

    expect(onReset).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('only resets the matching widget when several are subscribed', () => {
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = subscribeWidgetPreviewReset(1, first);
    const unsubscribeSecond = subscribeWidgetPreviewReset(2, second);

    resetWidgetPreview(2);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    unsubscribeFirst();
    unsubscribeSecond();
  });

  it('stops calling the listener after unsubscribing', () => {
    const onReset = vi.fn();
    const unsubscribe = subscribeWidgetPreviewReset('12', onReset);

    unsubscribe();
    resetWidgetPreview('12');

    expect(onReset).not.toHaveBeenCalled();
  });

  it('never matches a widget without an id', () => {
    const onReset = vi.fn();
    const unsubscribe = subscribeWidgetPreviewReset(undefined, onReset);

    resetWidgetPreview('12');

    expect(onReset).not.toHaveBeenCalled();
    unsubscribe();
  });
});
