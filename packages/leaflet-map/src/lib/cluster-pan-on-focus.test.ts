// @vitest-environment jsdom
import L from 'leaflet';
import 'leaflet.markercluster';
import { describe, expect, it } from 'vitest';

import { disableClusterPanOnFocus } from './clustering-config';

describe('disableClusterPanOnFocus', () => {
  it('does nothing when the cluster plugin is not loaded', () => {
    expect(disableClusterPanOnFocus({})).toBe(false);
    expect(disableClusterPanOnFocus(undefined)).toBe(false);
  });

  it('stops clusters from sliding the map when they get keyboard focus', () => {
    const MarkerCluster = (L as any).MarkerCluster;
    expect(MarkerCluster.prototype.options.autoPanOnFocus).toBe(true);

    expect(disableClusterPanOnFocus(L)).toBe(true);

    expect(MarkerCluster.prototype.options.autoPanOnFocus).toBe(false);
    expect((L as any).Marker.prototype.options.autoPanOnFocus).toBe(true);
  });
});
