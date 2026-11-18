/** The polygon URL inputs by id, taken from the saved polygons first. */
export function polygonUrlDefaults(
  customPolygon: unknown,
  customPolygonUrl: unknown
): any {
  const urls: any = Array.isArray(customPolygonUrl)
    ? [...customPolygonUrl]
    : customPolygonUrl && typeof customPolygonUrl === 'object'
      ? { ...customPolygonUrl }
      : [];
  if (Array.isArray(customPolygon)) {
    customPolygon.forEach((polygon: any) => {
      if (polygon?.id !== undefined && typeof polygon.url === 'string') {
        urls[Number(polygon.id)] = polygon.url;
      }
    });
  }
  return urls;
}
