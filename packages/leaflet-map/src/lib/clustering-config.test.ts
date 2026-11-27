import { describe, expect, it, vi } from 'vitest';

import {
  activateClusterOnSpace,
  getClusteringConfig,
  getEffectiveMaxZoom,
  getMapMaxZoom,
  shouldClusterMarker,
  shouldRenderClusterGroup,
} from './clustering-config';

describe('getClusteringConfig', () => {
  it('maps low, medium and high to a radius', () => {
    expect(getClusteringConfig({ clustering: 'low' })).toEqual({
      isActive: true,
      maxClusterRadius: 20,
    });
    expect(getClusteringConfig({ clustering: 'medium' })).toEqual({
      isActive: true,
      maxClusterRadius: 40,
    });
    expect(getClusteringConfig({ clustering: 'high' })).toEqual({
      isActive: true,
      maxClusterRadius: 80,
    });
  });

  it('is inactive for off, undefined and unknown values', () => {
    expect(getClusteringConfig({ clustering: 'off' })).toEqual({
      isActive: false,
    });
    expect(getClusteringConfig(undefined)).toEqual({ isActive: false });
    expect(getClusteringConfig({})).toEqual({ isActive: false });
    expect(getClusteringConfig({ clustering: 'nonsense' })).toEqual({
      isActive: false,
    });
    expect(getClusteringConfig({ clustering: 'toString' })).toEqual({
      isActive: false,
    });
  });
});

describe('shouldClusterMarker', () => {
  it('clusters a normal marker when active', () => {
    expect(shouldClusterMarker({}, { isActive: true })).toBe(true);
  });

  it('never clusters when inactive', () => {
    expect(shouldClusterMarker({}, { isActive: false })).toBe(false);
    expect(shouldClusterMarker({}, undefined)).toBe(false);
  });

  it('never clusters a marker with doNotCluster', () => {
    expect(
      shouldClusterMarker({ doNotCluster: true }, { isActive: true })
    ).toBe(false);
  });
});

describe('shouldRenderClusterGroup', () => {
  it('renders a group that has markers', () => {
    expect(shouldRenderClusterGroup(3, true)).toBe(true);
  });

  it('never renders a group when clustering is off', () => {
    expect(shouldRenderClusterGroup(3, false)).toBe(false);
  });

  it('does not render an empty group', () => {
    expect(shouldRenderClusterGroup(0, true)).toBe(false);
  });
});

describe('getEffectiveMaxZoom', () => {
  it('keeps normal zoom values, also when saved as text', () => {
    expect(getEffectiveMaxZoom(18)).toBe(18);
    expect(getEffectiveMaxZoom('19')).toBe(19);
  });

  it('caps extreme values so the cluster plugin cannot spin forever', () => {
    expect(getEffectiveMaxZoom('201')).toBe(25);
    expect(getEffectiveMaxZoom(60)).toBe(25);
  });

  it('falls back to the default for empty or invalid values', () => {
    expect(getEffectiveMaxZoom(undefined)).toBe(20);
    expect(getEffectiveMaxZoom(null)).toBe(20);
    expect(getEffectiveMaxZoom('')).toBe(20);
    expect(getEffectiveMaxZoom('abc')).toBe(20);
    expect(getEffectiveMaxZoom(0)).toBe(20);
    expect(getEffectiveMaxZoom(-3)).toBe(20);
  });
});

describe('getMapMaxZoom', () => {
  it('leaves the project max zoom untouched when clustering is off', () => {
    expect(getMapMaxZoom(201, false)).toBe(201);
    expect(getMapMaxZoom(18, false)).toBe(18);
    expect(getMapMaxZoom(undefined, false)).toBeUndefined();
  });

  it('caps the max zoom when clustering is on', () => {
    expect(getMapMaxZoom(201, true)).toBe(25);
    expect(getMapMaxZoom(18, true)).toBe(18);
  });
});

describe('activateClusterOnSpace', () => {
  function pressOnCluster(key: string) {
    const originalEvent = { key, preventDefault: vi.fn() };
    const layer = { fire: vi.fn() };
    const container = { focus: vi.fn() };
    const handled = activateClusterOnSpace(
      { originalEvent, layer } as any,
      container as any
    );
    return { handled, originalEvent, layer, container };
  }

  it('zooms in on Space without scrolling the page', () => {
    const { handled, originalEvent, layer, container } = pressOnCluster(' ');
    expect(handled).toBe(true);
    expect(originalEvent.preventDefault).toHaveBeenCalled();
    expect(layer.fire).toHaveBeenCalledWith('click', { originalEvent }, true);
    expect(container.focus).toHaveBeenCalled();
  });

  it('ignores other keys', () => {
    const { handled, originalEvent, layer, container } = pressOnCluster('a');
    expect(handled).toBe(false);
    expect(originalEvent.preventDefault).not.toHaveBeenCalled();
    expect(layer.fire).not.toHaveBeenCalled();
    expect(container.focus).not.toHaveBeenCalled();
  });
});
