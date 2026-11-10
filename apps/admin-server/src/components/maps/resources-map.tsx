import { MapPoint, getPointsBounds } from '@/lib/resource-map-points';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useMemo, useState } from 'react';

import { allowLeafletContainerReuse } from './allow-leaflet-container-reuse';

type Bounds = [[number, number], [number, number]];

type Props = {
  points: Array<MapPoint>;
  onSelect: (id: number) => void;
};

function FitToPoints({
  bounds,
  useMap,
}: {
  bounds: Bounds | null;
  useMap: () => any;
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
    }
  }, [bounds, map]);
  return null;
}

export default function ResourcesMap({ points, onSelect }: Props) {
  const [leafletComponents, setLeafletComponents] = useState<any>(null);

  useEffect(() => {
    import('leaflet')
      .then((L) => {
        allowLeafletContainerReuse(L);
        return import('react-leaflet');
      })
      .then((leaflet) => setLeafletComponents(leaflet))
      .catch((error) => console.error('Failed to load react-leaflet', error));
  }, []);

  const bounds = useMemo(() => getPointsBounds(points), [points]);

  if (!leafletComponents) {
    return <div>Kaart is aan het laden...</div>;
  }

  const { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } =
    leafletComponents;

  return (
    <MapContainer
      preferCanvas
      center={{ lat: 52.129507, lng: 4.670647 }}
      zoom={7}
      scrollWheelZoom
      style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        referrerPolicy="no-referrer-when-downgrade"
      />
      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={[point.lat, point.lng]}
          radius={7}
          pathOptions={{ color: '#1d4ed8', fillOpacity: 0.7 }}
          eventHandlers={{ click: () => onSelect(point.id) }}>
          <Tooltip>{point.title}</Tooltip>
        </CircleMarker>
      ))}
      <FitToPoints bounds={bounds} useMap={useMap} />
    </MapContainer>
  );
}
