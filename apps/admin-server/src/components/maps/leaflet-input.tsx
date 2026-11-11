import useArea from '@/hooks/use-area';
import { useProject } from '@/hooks/use-project';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useMemo, useState } from 'react';

import { allowLeafletContainerReuse } from './allow-leaflet-container-reuse';

interface LeafletComponents {
  MapContainer: React.ComponentType<any>;
  TileLayer: React.ComponentType<any>;
  Marker: React.ComponentType<any>;
  Polygon: React.ComponentType<any>;
  useMapEvents: (events: { [key: string]: (e: any) => void }) => void;
  useMap: () => any;
}

interface MapComponentProps {
  onSelectLocation?: (location: string) => void;
  field: any;
  center?: { lat: number; lng: number };
}

function flattenLatLngs(input: any): Array<{ lat: number; lng: number }> {
  if (!Array.isArray(input)) return [];
  if (
    input.length > 0 &&
    typeof input[0]?.lat === 'number' &&
    typeof input[0]?.lng === 'number'
  ) {
    return input;
  }
  return input.flatMap((item: any) => flattenLatLngs(item));
}

function getBoundsFromPolygon(
  polygon: any
): [[number, number], [number, number]] | null {
  const points = flattenLatLngs(polygon);
  if (!points.length) return null;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

function FitToPolygon({
  bounds,
  useMap,
}: {
  bounds: [[number, number], [number, number]] | null;
  useMap: () => any;
}) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  return null;
}

const MapInput: React.FC<MapComponentProps> = ({
  onSelectLocation,
  field,
  center = { lat: 52.129507, lng: 4.670647 },
}) => {
  const [isSSR, setIsSSR] = useState(true);
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [leafletComponents, setLeafletComponents] =
    useState<LeafletComponents | null>(null);
  const [dynamicMarkerIcon, setDynamicMarkerIcon] =
    useState<React.ComponentType<any> | null>(null);

  const { data: projectData } = useProject();
  const rawAreaId = projectData?.config?.map?.areaId;
  const areaId =
    rawAreaId && String(rawAreaId) !== '0' ? String(rawAreaId) : undefined;
  const { data: areaData } = useArea(areaId);
  const polygon = areaData?.polygon;
  const bounds = useMemo(
    () => (polygon ? getBoundsFromPolygon(polygon) : null),
    [polygon]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSSR(false);

      import('leaflet').then((L) => allowLeafletContainerReuse(L));

      import('react-leaflet')
        .then((leaflet) => {
          setLeafletComponents(leaflet);
        })
        .catch((error) => console.error('Failed to load react-leaflet', error));

      import('@openstad-headless/leaflet-map/src/marker-icon').then(
        (module) => {
          // Assuming MarkerIcon is the default export
          const MarkerIcon = module.default;
          // Create the icon with desired properties
          const icon = MarkerIcon({ icon: { className: '--defaultIcon' } });
          setDynamicMarkerIcon(icon);
        }
      );
    }
  }, []);

  useEffect(() => {
    import('leaflet').then((L) => {
      if (dynamicMarkerIcon !== null) {
        // Check if field value has saved coordinates and set marker position
        if (field && field.value) {
          try {
            const { lat, lng } = JSON.parse(field.value);
            if (
              !isNaN(lat) &&
              !isNaN(lng) &&
              (!markerPosition ||
                markerPosition.lat !== lat ||
                markerPosition.lng !== lng)
            ) {
              setMarkerPosition(L.latLng(lat, lng));
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
  }, [field.value, dynamicMarkerIcon]);

  useEffect(() => {
    if (markerPosition && onSelectLocation) {
      const markerPositionString = `${markerPosition.lat},${markerPosition.lng}`;
      onSelectLocation(markerPositionString);
    }
  }, [markerPosition, onSelectLocation]);

  if (isSSR || !leafletComponents) {
    return <div>Kaart is aan het laden...</div>;
  }

  const { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } =
    leafletComponents;

  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        setMarkerPosition(e.latlng);
      },
    });
    return null;
  };

  return (
    <div>
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: '600px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {polygon && (
          <Polygon
            positions={polygon}
            pathOptions={{ color: '#3388ff', weight: 2, fillOpacity: 0.05 }}
          />
        )}
        {markerPosition && (
          <Marker position={markerPosition} icon={dynamicMarkerIcon} />
        )}
        <FitToPolygon bounds={bounds} useMap={useMap} />
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default MapInput;
