import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import type * as ReactLeaflet from 'react-leaflet';

type LeafletComponents = Pick<
  typeof ReactLeaflet,
  'MapContainer' | 'TileLayer' | 'Marker' | 'useMapEvents'
>;

// Leaflet stores its internal map id on the container element.
type LeafletContainer = HTMLElement & { _leaflet_id?: number };

interface MapComponentProps {
  onSelectLocation?: (location: string) => void;
  field: { value?: string };
  center?: { lat: number; lng: number };
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
  const [dynamicMarkerIcon, setDynamicMarkerIcon] = useState<
    L.Icon | L.DivIcon | null
  >(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSSR(false);

      import('leaflet').then((L) => {
        // any: Leaflet's private `_initContainer` is an untyped internal API.
        // We patch it to clear a stale `_leaflet_id` so the same container can
        // be re-initialised (e.g. under React StrictMode double-mount).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proto = L.Map.prototype as any;
        const orig = proto._initContainer;
        proto._initContainer = function (id: string | LeafletContainer) {
          const container: LeafletContainer | null =
            typeof id === 'string' ? document.getElementById(id) : id;
          if (container && container._leaflet_id) {
            container._leaflet_id = undefined;
          }
          return orig.call(this, id);
        };
      });

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
      if (dynamicMarkerIcon !== null && markerPosition === null) {
        // Check if field value has saved coordinates and set marker position
        if (field && field.value) {
          try {
            const { lat, lng } = JSON.parse(field.value);
            if (!isNaN(lat) && !isNaN(lng)) {
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

  const { MapContainer, TileLayer, Marker, useMapEvents } = leafletComponents;

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
        scrollWheelZoom={false}
        style={{ height: '600px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {markerPosition && (
          <Marker
            position={markerPosition}
            icon={dynamicMarkerIcon ?? undefined}
          />
        )}
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export default MapInput;
