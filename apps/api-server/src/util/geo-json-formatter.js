const convertDbPolygonToLatLng = require('./convert-db-polygon-to-lat-lng');

exports.formatPolygonToGeoJson = (polygons) => {
  if (!polygons) return { type: 'FeatureCollection', features: [] };

  // Detect structure from getter:
  // Polygon: [[{lat,lng},...], [{lat,lng},...]] - array of rings (each ring is array of points)
  // MultiPolygon: [[[{lat,lng},...]], [[{lat,lng},...]]] - array of polygons with rings
  const firstElement = polygons[0];
  const isMultiPolygon =
    Array.isArray(firstElement) &&
    Array.isArray(firstElement[0]) &&
    firstElement[0][0]?.lat !== undefined;

  if (isMultiPolygon) {
    // MultiPolygon: each element is a polygon with rings
    const features = polygons.map((polygon) => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: polygon.map((ring) =>
          ring.map((point) => [point.lng, point.lat])
        ),
      },
    }));
    return { type: 'FeatureCollection', features: features };
  } else {
    // Single Polygon with rings (including holes)
    // polygons = [ring0, ring1, ...] where each ring is [{lat,lng}, ...]
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: polygons.map((ring) =>
          ring.map((point) => [point.lng, point.lat])
        ),
      },
    };
    return { type: 'FeatureCollection', features: [feature] };
  }
};

exports.formatGeoJsonToPolygon = (geoJSON) => {
  if (!geoJSON || !geoJSON.features || geoJSON.features.length === 0) return [];

  // Collect all polygons from all features, normalizing to array of polygons with rings
  // Each polygon is [[ring1], [ring2], ...] where rings include outer boundary + holes
  const result = geoJSON.features.flatMap((feature) => {
    if (!feature.geometry) return [];

    if (feature.geometry.type === 'Polygon') {
      // Polygon returns array of rings, wrap in array to make it one polygon
      const rings = convertDbPolygonToLatLng(feature.geometry, 1, 0);
      return [rings]; // [[ring1, ring2, ...]]
    }

    if (feature.geometry.type === 'MultiPolygon') {
      // MultiPolygon returns array of polygons, each with rings
      const polygons = convertDbPolygonToLatLng(feature.geometry, 1, 0);
      const totalRings = polygons.reduce((sum, p) => sum + p.length, 0);
      const totalPoints = polygons.reduce(
        (sum, p) => sum + p.reduce((s, r) => s + r.length, 0),
        0
      );
      return polygons; // [[ring1, ...], [ring1, ...], ...]
    }

    return [];
  });

  return result;
};
