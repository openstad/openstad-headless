export type MapPoint = { id: number; title: string; lat: number; lng: number };

function toCoordinate(value: unknown): number {
  if (value === null || value === undefined || value === '') return NaN;
  return Number(value);
}

export function toMapPoints(
  resources: Array<{ id: number; title?: string; location?: any }>
): Array<MapPoint> {
  return resources
    .map((resource) => ({
      id: resource.id,
      title: resource.title || `Inzending ${resource.id}`,
      lat: toCoordinate(resource.location?.lat),
      lng: toCoordinate(resource.location?.lng),
    }))
    .filter(
      (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng)
    );
}

export function getPointsBounds(
  points: Array<MapPoint>
): [[number, number], [number, number]] | null {
  if (points.length === 0) return null;
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}
