// @ts-ignore
import { useEffect } from 'react';
// @ts-ignore
import { useMap } from 'react-leaflet/hooks';

declare global {
  interface Window {
    oscMap: any;
  }
}

export function useMapRef(mapId: string) {
  if (!window.oscMap) window.oscMap = {};
  if (!window.oscMap[mapId]) window.oscMap[mapId] = { map: null };

  let val = window.oscMap[mapId];

  function setMapRef(ref: object) {
    // ponytail: altijd de actuele instance bewaren; een stale ref na remount gaf
    // een leak + kon een verwijderde kaart teruggeven.
    window.oscMap[mapId].map = ref;
  }

  return [val.map, setMapRef];
}

type MapConsumerProps = {
  mapId: string;
};

export function MapConsumer({ mapId }: MapConsumerProps) {
  const map = useMap();

  let [, setMapRef] = useMapRef(mapId);
  setMapRef(map);

  // ponytail: wis de globale cache bij unmount, anders blijft een stale Leaflet-instance hangen.
  useEffect(() => {
    return () => {
      if (window.oscMap) delete window.oscMap[mapId];
    };
  }, [mapId]);

  return null;
}

export default MapConsumer;
