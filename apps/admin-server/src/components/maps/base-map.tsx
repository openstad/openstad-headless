import React, { useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon } from 'react-leaflet';
// import { EditControl } from "react-leaflet-draw"

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import useSWR from 'swr';

export default function BaseMap({
  projectId,
  areaId,
}: {
  projectId: string;
  areaId: string;
}) {
  const { data, isLoading } = useSWR(
    `/api/openstad/api/project/${projectId}/area/${areaId}`
  );

  if (!data) return null;

  return (
    <MapContainer
      style={{ height: '400px', width: '100%' }}
      center={{ lat: 52.129507, lng: 4.670647 }}
      zoom={7}
      scrollWheelZoom={false}>
      <FeatureGroup>
        {/* <EditControl
            position="topright"
            draw={{
                marker: false,
                circlemarker: false,
                polyline: false,
                rectangle: false,
                circle: false
            }}
            /> */}
      </FeatureGroup>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polygon positions={data.polygon} />
    </MapContainer>
  );
}
