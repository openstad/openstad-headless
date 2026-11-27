import { describe, expect, it } from 'vitest';

import { bindLeafletToMarkerCluster } from './bind-leaflet-plugin';

const ID =
  '/repo/node_modules/leaflet.markercluster/dist/leaflet.markercluster-src.js';

describe('bindLeafletToMarkerCluster', () => {
  const plugin: any = bindLeafletToMarkerCluster();

  it('only runs during a build, before other plugins', () => {
    expect(plugin.apply).toBe('build');
    expect(plugin.enforce).toBe('pre');
  });

  it('wraps the markercluster source so L is our own imported Leaflet', () => {
    const result = plugin.transform('var x = L.Marker;', ID);
    expect(result.code).toContain("import L from 'leaflet';");
    expect(result.code).toContain('(function (L) {\nvar x = L.Marker;\n})(L);');
    expect(result.code).toContain('export {};');
  });

  it('handles Windows-style paths', () => {
    const win = ID.replace(/\//g, '\\');
    expect(plugin.transform('x', win)).not.toBeNull();
  });

  it('leaves other files and bundler helper ids alone', () => {
    expect(
      plugin.transform('x', '/repo/node_modules/leaflet/dist/leaflet-src.js')
    ).toBeNull();
    expect(plugin.transform('x', `${ID}?commonjs-proxy`)).toBeNull();
  });
});
