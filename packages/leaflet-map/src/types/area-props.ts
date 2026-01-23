import { LatLng } from 'leaflet';

export type AreaProps = {
  area?: Array<LatLng> | Array<Array<LatLng>>,
  renderArea?: Array<LatLng> | Array<Array<LatLng>>,
  areas?: any,
  areaPolygonStyle?: any,
  interactionType?: 'default' | 'direct',
  showHiddenPolygonsForAdmin?: boolean,
  adminOnlyPolygons?: any,
};
