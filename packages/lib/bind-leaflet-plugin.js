/** Makes leaflet.markercluster use the Leaflet of its own bundle instead of window.L. */
export function bindLeafletToMarkerCluster() {
  return {
    name: 'openstad-bind-leaflet-to-markercluster',
    enforce: 'pre',
    apply: 'build',
    transform(code, id) {
      if (id.includes('?')) return null;
      const file = id.replace(/\\/g, '/');
      if (
        !/\/leaflet\.markercluster\/dist\/leaflet\.markercluster-src\.js$/.test(
          file
        )
      ) {
        return null;
      }
      return {
        code: `import L from 'leaflet';\n(function (L) {\n${code}\n})(L);\nexport {};`,
        map: null,
      };
    },
  };
}
