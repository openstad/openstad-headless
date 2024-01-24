import { LeafletMouseEvent } from 'leaflet';
import { MarkerProps } from './marker-props';
import { MarkerClusterGroupProps } from './marker-cluster-group-props';
import { MarkerIconType } from './marker-icon';
import { LocationType } from './location';
import { CategorizeType } from './categorize';

export type BaseMapProps = {
  markers?: MarkerProps[],
	zoom?: number,
  autoZoomAndCenter?: 'area' | 'markers',
  scrollWheelZoom?: boolean,
	center?: LocationType,
  defaultIcon?: MarkerIconType,
  iconCreateFunction?: () => string,
  onClick?: (e: LeafletMouseEvent, map: any) => void,
  onMarkerClick?: (e: LeafletMouseEvent, map: any) => void,
  zoomposition: string,
	disableDefaultUI: boolean,
  clustering: MarkerClusterGroupProps,
  categorize: CategorizeType,
};

