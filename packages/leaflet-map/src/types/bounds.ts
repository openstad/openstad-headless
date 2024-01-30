import type { LatLng } from 'leaflet';
import type { MarkerProps } from './marker-props';
import type { LocationType } from './location';

export type BoundsParams =
  Array<LocationType> |
  Array<MarkerProps> |
  Array<{
    _latlng: LatLng,
    location?: {
      coordinates?: Array<number>,
    },
    position?: {
      coordinates?: Array<number>,
    },
  }>;
