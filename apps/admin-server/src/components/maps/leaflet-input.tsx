import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { marker } from 'leaflet';

interface LeafletComponents {
  MapContainer: React.ComponentType<any>;
  TileLayer: React.ComponentType<any>;
  Marker: React.ComponentType<any>;
  useMapEvents: (events: { [key: string]: (e: any) => void }) => void;
}

interface MapComponentProps {
  onSelectLocation?: (location: string) => void;
  field: any;
  center?: { lat: number; lng: number };
}

const MapInput: React.FC<MapComponentProps> = ({ onSelectLocation, field, center = {lat: 52.129507, lng:4.670647} }) => {
  const [isSSR, setIsSSR] = useState(true);
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [leafletComponents, setLeafletComponents] = useState<LeafletComponents | null>(null);
  const [dynamicMarkerIcon, setDynamicMarkerIcon] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSSR(false);
      import('react-leaflet')
        .then(leaflet => {
          setLeafletComponents(leaflet);
        })
        .catch(error => console.error('Failed to load react-leaflet', error));

      import('@openstad-headless/leaflet-map/src/marker-icon').then((module) => {
          // Assuming MarkerIcon is the default export
          const MarkerIcon = module.default;
          // Create the icon with desired properties
          const icon = MarkerIcon({ icon: { className: '--defaultIcon' } });
          setDynamicMarkerIcon(icon);
        });
    }
  }, []);

  useEffect(() => {
    import ('leaflet').then((L) => {
          if(dynamicMarkerIcon !== null && markerPosition === null) {
            // Check if field value has saved coordinates and set marker position
            if (field && field.value) {
              try{
                const { lat, lng } = JSON.parse(field.value);
                if (!isNaN(lat) && !isNaN(lng)) {
                  setMarkerPosition(L.latLng(lat, lng));
                }
              } catch(e) {
                console.log(e)
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
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markerPosition &&  <Marker position={markerPosition} icon={dynamicMarkerIcon} />}
            <MapEvents />
        </MapContainer>
    </div>
  );
};

export default MapInput;