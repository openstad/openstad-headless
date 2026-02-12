module.exports = function (polygon, latKey = 0, longKey = 1) {
  // TODO: resolve temporary fix for development (empty database)
  if (!polygon || !polygon.coordinates || !polygon.coordinates[0]) return [];

  const polygonType = polygon.type;

  if (polygonType === 'MultiPolygon') {
    return polygon.coordinates.map((poly) => {
      return poly.map((ring) => {
        return ring.map((x) => ({ lat: x[latKey], lng: x[longKey] }));
      });
    });
  }

  if (polygonType === 'Polygon') {
    return polygon.coordinates.map((ring) => {
      return ring.map((x) => ({ lat: x[latKey], lng: x[longKey] }));
    });
  }

  return [];
}
