import React from 'react';
import { useEffect } from 'react';
// @ts-ignore
import { useMap } from 'react-leaflet/hooks';

export function InvalidateSizeOnResize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      if (container.clientHeight && container.clientWidth) {
        try {
          map.invalidateSize();
        } catch (e) {
          console.warn('invalidateSize failed:', e);
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}
