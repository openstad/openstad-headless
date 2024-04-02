import type { DivIconOptions } from 'leaflet';

export type MarkerIconType = DivIconOptions & {
   color?: string;
  iconCreateFunction?: Function | string;
};
