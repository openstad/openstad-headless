import { useMap } from 'react-leaflet/hooks';

declare global {
    interface Window { oscMap: any; }
}

export function useMapRef(mapId: string) {

  if (!window.oscMap) window.oscMap = {};
  if (!window.oscMap[mapId]) window.oscMap[mapId] = { map: null };

  let val = window.oscMap[mapId];

  function setMapRef(ref: object) {
    if (val.map) return;
    window.oscMap[mapId].map = ref
  }
  
  return [ val.map, setMapRef ];

}

type MapConsumerProps = {
  mapId: string,
};


export function MapConsumer({
  mapId,
}: MapConsumerProps) {

  const map = useMap();

  let [ , setMapRef ] = useMapRef(mapId);
  setMapRef(map);

  return null;

}

export default MapConsumer;

