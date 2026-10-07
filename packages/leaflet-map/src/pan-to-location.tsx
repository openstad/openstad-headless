import { useEffect } from 'react';
// @ts-ignore
import { useMap } from 'react-leaflet/hooks';

import type { LocationType } from './types/location';

export function PanToLocation({ location }: { location?: LocationType }) {
  const map = useMap();

  useEffect(() => {
    if (
      location &&
      typeof location.lat === 'number' &&
      typeof location.lng === 'number'
    ) {
      map.panTo({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  return null;
}

export default PanToLocation;
