import type { Map as LeafletMap } from 'leaflet';
import { LatLng, latLngBounds } from 'leaflet';
import React from 'react';
import { useEffect, useRef } from 'react';
// @ts-ignore
import { useMap } from 'react-leaflet/hooks';

import parseLocation from './lib/parse-location';
import type { AreaShape } from './types/area-props';
import type { LocationType } from './types/location';
import type { MarkerProps } from './types/marker-props';

type AutoZoomProps = {
  autoZoomAndCenter?: 'area' | 'markers';
  area?: AreaShape;
  markers?: Array<MarkerProps>;
  center?: LocationType;
  zoomAfterInit?: boolean;
};

type LatLngLike = { lat: number; lng: number };

function isLatLngLike(value: unknown): value is LatLngLike {
  return (
    !!value &&
    typeof value === 'object' &&
    'lat' in value &&
    'lng' in value &&
    typeof (value as LatLngLike).lat === 'number' &&
    typeof (value as LatLngLike).lng === 'number'
  );
}

function collectAreaRings(input: unknown): LatLng[][] {
  if (!Array.isArray(input) || input.length === 0) return [];

  if (isLatLngLike(input[0])) {
    const ring = (input as LocationType[])
      .map(parseLocation)
      .filter(
        (point): point is LatLng =>
          !Array.isArray(point) && point?.lat != null && point?.lng != null
      );
    return ring.length ? [ring] : [];
  }

  return input.flatMap((entry) => collectAreaRings(entry));
}

function buildMarkerFingerprint(markers?: Array<MarkerProps>): string {
  if (!markers || markers.length === 0) return '';
  return markers
    .filter((m) => m.lat && m.lng)
    .map((m) => m.markerId || `${m.lat},${m.lng}`)
    .sort()
    .join('|');
}

export function AutoZoom({
  autoZoomAndCenter,
  area,
  markers,
  center,
  zoomAfterInit = true,
}: AutoZoomProps) {
  const map: LeafletMap = useMap();
  const hasInitialZoomed = useRef(false);
  const prevMarkerFingerprint = useRef('');

  const definedCenter: LatLngLike =
    center?.lat && center?.lng
      ? { lat: center.lat, lng: center.lng }
      : { lat: 52.37104644463586, lng: 4.900402911007405 };

  useEffect(() => {
    if (!autoZoomAndCenter) return;

    const container = map.getContainer();
    if (!container.clientHeight || !container.clientWidth) {
      return;
    }

    const isInitial = !hasInitialZoomed.current;

    if (isInitial) {
      const success = zoomTo(autoZoomAndCenter, 0);
      if (success) {
        hasInitialZoomed.current = true;
        prevMarkerFingerprint.current = buildMarkerFingerprint(markers);
      }
      return;
    }

    if (!zoomAfterInit) return;
    if (autoZoomAndCenter !== 'markers') return;

    const fingerprint = buildMarkerFingerprint(markers);
    if (fingerprint === prevMarkerFingerprint.current) return;

    prevMarkerFingerprint.current = fingerprint;
    zoomTo('markers', 0);
  }, [autoZoomAndCenter, area, markers]);

  function zoomTo(mode: 'area' | 'markers', depth: number): boolean {
    if (mode === 'area') {
      return zoomToArea();
    } else if (mode === 'markers') {
      return zoomToMarkers(depth);
    }
    return false;
  }

  function zoomToArea(): boolean {
    if (area && Array.isArray(area) && area.length > 0) {
      const normalizedArea = Array.isArray(area[0]) ? area : [area];
      return fitArea(normalizedArea);
    }
    return false;
  }

  function zoomToMarkers(depth: number): boolean {
    const validMarkers =
      markers?.filter(
        (m): m is MarkerProps & LatLngLike => !!m.lat && !!m.lng
      ) || [];

    if (validMarkers.length === 0) {
      if (depth < 2) {
        return zoomToArea();
      }
      return false;
    }

    const bounds = latLngBounds(validMarkers);
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      const maxAllowed = map.getMaxZoom() || 20;
      map.setView(
        bounds.getCenter(),
        Math.min(Math.max(map.getZoom(), 15), maxAllowed)
      );
      return true;
    }

    map.fitBounds(bounds, { padding: [20, 20] });
    return true;
  }

  function fitArea(polygons: unknown[]): boolean {
    const allRings = collectAreaRings(polygons);

    if (allRings.length === 0) {
      return false;
    }

    if (
      allRings.length === 1 &&
      allRings[0].length === 1 &&
      allRings[0][0].lat &&
      allRings[0][0].lng
    ) {
      map.panTo(new LatLng(allRings[0][0].lat, allRings[0][0].lng));
      return true;
    }

    let combinedBounds = latLngBounds([]);
    allRings.forEach((ring) => {
      const bounds = latLngBounds(
        ring.map(
          (p) =>
            new LatLng(p.lat || definedCenter.lat, p.lng || definedCenter.lng)
        )
      );
      combinedBounds.extend(bounds);
    });

    map.fitBounds(combinedBounds);
    return true;
  }

  return null;
}
