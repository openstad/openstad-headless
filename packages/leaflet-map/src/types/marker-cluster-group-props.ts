import { MarkerCluster } from 'leaflet';
import 'leaflet.markercluster';

import type { CategorizeType } from './categorize';
import type { MarkerProps } from './marker-props';

export type MarkerClusterGroupProps = {
  isActive?: boolean;
  maxClusterRadius?: number;
  showCoverageOnHover?: boolean;
  categorize?: CategorizeType;
  iconCreateFunction?: (cluster: MarkerCluster, categorize: any) => any; // TODO
  markers?: Array<MarkerProps>;
};
