import type { AreaProps } from './area-props';
import type { BaseMapProps } from './basemap-props';
import type { MapTilesProps } from './map-tiles-props';
import type { MarkerClusterGroupProps } from './marker-cluster-group-props';
import type { MarkerProps } from './marker-props';

export type MapPropsType = BaseMapProps &
  MapTilesProps &
  MarkerProps &
  MarkerClusterGroupProps &
  AreaProps;
