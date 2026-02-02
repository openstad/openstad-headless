import { LatLng } from 'leaflet';

export type AreaProps = {
  area?: Array<LatLng> | Array<Array<LatLng>>,
  renderArea?: Array<LatLng> | Array<Array<LatLng>>,
  areas?: any,
  areaPolygonStyle?: any,
  interactionType?: 'default' | 'direct',
  areaRenderMode?: 'cutout' | 'polygons',
  showHiddenPolygonsForAdmin?: boolean,
  adminOnlyPolygons?: any,
};
