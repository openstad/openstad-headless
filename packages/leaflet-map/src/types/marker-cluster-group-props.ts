import { MarkerCluster } from 'leaflet';
import { MarkerProps } from './marker-props';

export type MarkerClusterGroupProps = {
  isActive?: boolean,
  maxClusterRadius?: number,
  showCoverageOnHover?: boolean,
  categorize?: { // ToDo: nog uit te werken
    categorizeByField: string,
    categories: any,
  },
  iconCreateFunction?: ( cluster: MarkerCluster, categorize: any ) => any, // TODO
  markers?: MarkerProps[],
};

