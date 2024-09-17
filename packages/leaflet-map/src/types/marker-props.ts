import type { LeafletMouseEvent } from 'leaflet';
import type { LocationType } from './location';
import type { MarkerIconType } from './marker-icon';

export type MarkerProps =
  LocationType & {
  markerId?: string,
  isFaded?: boolean,
  isVisible?: boolean,
  icon?: MarkerIconType,
  iconCreateFunction?: () => any, // TODO
  defaultIcon?: MarkerIconType,
  href?: string,
  onClick?: any, // ToDo: ik krijg dit niet werkend in de basemap: ((e: LeafletMouseEvent, map: any) => void) | ((e: LeafletMouseEvent, map: any) => void)[],
  doNotCluster?: boolean,
  isClustered?: boolean,
  onMouseDown?: (e: LeafletMouseEvent, map: any) => void,
  onMouseUp?: (e: LeafletMouseEvent, map: any) => void,
  onDragStart?: (e: LeafletMouseEvent, map: any) => void,
  onDragEnd?: (e: LeafletMouseEvent, map: any) => void,
  data?: any,
  color?: string;
};

