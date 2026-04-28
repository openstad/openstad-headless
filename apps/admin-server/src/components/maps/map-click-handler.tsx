import React, { useEffect, useRef } from 'react';

interface MapClickHandlerProps {
  useMapEvents: (events: { [key: string]: (e: any) => void }) => void;
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
    click: (e: any) => onMapClickRef.current(e.latlng),
  });

  return null;
}
