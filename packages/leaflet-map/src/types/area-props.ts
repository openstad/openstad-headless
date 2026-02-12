import { LatLng } from 'leaflet';

export type AreaRing = Array<LatLng>;
export type AreaPolygon = Array<AreaRing>;
export type AreaMultiPolygon = Array<AreaPolygon>;
export type AreaShape = AreaRing | AreaPolygon | AreaMultiPolygon;

export type AreaProps = {
  area?: AreaShape;
  renderArea?: AreaShape;
  areas?: any;
  areaPolygonStyle?: any;
  interactionType?: 'default' | 'direct';
  areaRenderMode?: 'cutout' | 'polygons';
  showHiddenPolygonsForAdmin?: boolean;
  adminOnlyPolygons?: any;
};
