import 'leaflet.markercluster';

import {MarkerCluster} from 'leaflet'
import type { MarkerProps } from './marker-props';
import type { CategorizeType } from './categorize';

export type MarkerClusterGroupProps = {
  isActive?: boolean,
  maxClusterRadius?: number,
  showCoverageOnHover?: boolean,
  categorize?: CategorizeType,
  iconCreateFunction?: ( cluster: MarkerCluster, categorize: any ) => any, // TODO
  markers?: Array<MarkerProps>,
};

