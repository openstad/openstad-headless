import { MarkerCluster } from 'leaflet';
import { MarkerProps } from './marker-props';

export type MarkerClusterGroupProps = {
  isActive?: boolean,
  maxClusterRadius?: number,
  showCoverageOnHover?: boolean,
  categorize?: {
    categorizeByField: string,
    categories: any, // ToDo: nog uit te werken
  },
  iconCreateFunction?: ( cluster: MarkerCluster, categorize: any ) => any, // TODO
  markers?: MarkerProps[],
};

