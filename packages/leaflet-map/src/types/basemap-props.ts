import type { LeafletMouseEvent } from 'leaflet';
import type { MarkerProps } from './marker-props';
import type { MarkerClusterGroupProps } from './marker-cluster-group-props';
import type { MarkerIconType } from './marker-icon';
import type { LocationType } from './location';
import type { CategorizeType } from './categorize';
import {DataLayer} from "./resource-overview-map-widget-props";

export type BaseMapProps = {
  width?: string,
  height?: string,
  markers?: Array<MarkerProps>,
	zoom?: number,
  autoZoomAndCenter?: 'area' | 'markers',
  scrollWheelZoom?: boolean,
	center?: LocationType,
  defaultIcon?: MarkerIconType,
  iconCreateFunction?: () => string,
  onClick?: (e: LeafletMouseEvent & {isInArea:boolean}, map: any) => void,
  onMarkerClick?: (e: LeafletMouseEvent, map: any) => void,
  zoomposition?: string,
	disableDefaultUI?: boolean,
  zoomAfterInit?: boolean,
  clustering?: MarkerClusterGroupProps,
  categorize?: CategorizeType,
  minZoom?: number,
  maxZoom?: number
  dataLayerSettings?: {
    datalayer?: DataLayer[];
    enableOnOffSwitching?: boolean;
  }
};