import React, { useEffect, useRef } from 'react';
import type { useMapEvents as UseMapEvents } from 'react-leaflet';

interface MapClickHandlerProps {
  useMapEvents: typeof UseMapEvents;
  onMapClick: (latlng: { lat: number; lng: number }) => void;
}

export default function MapClickHandler({
  useMapEvents,
  onMapClick,
}: MapClickHandlerProps) {
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useMapEvents({
    click: (e) => onMapClickRef.current(e.latlng),
  });

  return null;
}
