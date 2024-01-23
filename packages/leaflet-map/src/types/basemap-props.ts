import { LeafletMouseEvent } from 'leaflet';
import { MarkerProps } from './marker-props';
import { MarkerClusterGroupProps } from './marker-cluster-group-props';
import { MarkerIcon } from './marker-icon';
import { Location } from './location';
import { Categorize } from './categorize';

export type BaseMapProps = {
  markers?: MarkerProps[],
	zoom?: number,
  autoZoomAndCenter?: 'area' | 'markers',
  scrollWheelZoom?: boolean,
	center?: Location,
  defaultIcon?: MarkerIcon,
  iconCreateFunction?: () => string,
  onClick?: (e: LeafletMouseEvent, map: any) => void,
  onMarkerClick?: (e: LeafletMouseEvent, map: any) => void,
  zoomposition: string,
	disableDefaultUI: boolean,
  clustering: MarkerClusterGroupProps,
  categorize: Categorize,
};

