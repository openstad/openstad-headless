import { BaseMapProps } from './basemap-props';
import { MapTilesProps } from './map-tiles-props';
import { MarkerProps } from './marker-props';
import { MarkerClusterGroupProps } from './marker-cluster-group-props';
import { AreaProps } from './area-props';

export type MapPropsType = BaseMapProps & MapTilesProps & MarkerProps & MarkerClusterGroupProps & AreaProps;

