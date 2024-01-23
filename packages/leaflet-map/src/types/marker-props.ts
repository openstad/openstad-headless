import { LeafletMouseEvent } from 'leaflet';
import { Location } from './location';
import { MarkerIcon } from './marker-icon';

export type MarkerProps = {
  markerId?: string,
  lat?: number,
  lng?: number,
  location?: Location,
  isFaded?: boolean,
  isVisible?: boolean,
  icon?: MarkerIcon,
  iconCreateFunction?: () => any, // TODO
  defaultIcon?: MarkerIcon,
  href?: string,
  onClick?: any, // ToDo: ik krijg dit niet werkend in de basemap: ((e: LeafletMouseEvent, map: any) => void) | ((e: LeafletMouseEvent, map: any) => void)[],
  doNotCluster?: boolean,
  isClustered?: boolean,
  onMouseDown?: (e: LeafletMouseEvent, map: any) => void,
  onMouseUp?: (e: LeafletMouseEvent, map: any) => void,
  onDragStart?: (e: LeafletMouseEvent, map: any) => void,
  onDragEnd?: (e: LeafletMouseEvent, map: any) => void,
  data?: any,
};

