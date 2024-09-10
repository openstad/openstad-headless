module.exports = function (polygon, latKey = 0, longKey = 1) {
  // TODO: resolve temporary fix for development (empty database)
  if (!polygon || !polygon.coordinates || !polygon.coordinates[0]) return [];

  const polygonType = polygon.type;

  if ( polygonType === 'MultiPolygon') {
    return polygon.coordinates.map(polygon => {
      return polygon[0].map(x => {
        return {lat: x[latKey], lng: x[longKey]};
      });
    });
  } else {
    return polygon.coordinates[0].map(x => {
      return {lat: x[latKey], lng: x[longKey]};
    });
  }
}
