const convertDbPolygonToLatLng = require('./convert-db-polygon-to-lat-lng');

exports.formatPolygonToGeoJson = (polygons) => {
  if (!polygons) return { "type": "FeatureCollection", "features": [] };

  const polygonsArray = Array.isArray(polygons[0]) ? polygons : [polygons];

  const features = polygonsArray.map(polygon => ({
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [polygon.map(point => [point.lng, point.lat])] // Zet lng/lat om naar de juiste volgorde
    }
  }));

  return {
    "type": "FeatureCollection",
    "features": features
  };
};

exports.formatGeoJsonToPolygon = (geoJSON) => {
  if (!geoJSON || !geoJSON.features || geoJSON.features.length === 0) return [];

  return geoJSON.features.map(feature => {
    if (feature.geometry && feature.geometry.type === 'Polygon') {
      return convertDbPolygonToLatLng(feature.geometry, 1, 0);
    }
    return [];
  });
}

