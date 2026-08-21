import type { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { loadWidget } from '../../lib/load-widget';
import { BaseMap } from './base-map';
import './css/base-map.css';
import parseLocation from './lib/parse-location';
import type { EditorMapWidgetProps } from './types/editormap-widget-props';
import type { MarkerProps } from './types/marker-props';

const EditorMap = ({
  fieldName = 'location',
  centerOnEditorMarker = false,
  editorMarker = undefined,
  markerIcon = undefined,
  center = undefined,
  markers = [],
  onChange,
  fieldRequired = false,
  overrideDefaultValue = {},
  defaultValue = {},
  searchLocation = undefined,
  ...props
}: PropsWithChildren<EditorMapWidgetProps>) => {
  const isValidLocation = (
    val: any
  ): val is { lat: number; lng: number; icon?: string } =>
    val && typeof val === 'object' && 'lat' in val && 'lng' in val;

  const initialValue = isValidLocation(overrideDefaultValue)
    ? overrideDefaultValue
    : isValidLocation(defaultValue)
      ? defaultValue
      : editorMarker;

  let [currentEditorMarker, setCurrentEditorMarker] = useState<MarkerProps>({
    ...initialValue,
    icon: initialValue?.icon || markerIcon,
    doNotCluster: true,
  });

  useEffect(() => {
    if (isValidLocation(initialValue) && onChange) {
      onChange({ name: fieldName, value: initialValue });
    }
  }, [JSON.stringify(initialValue)]);

  parseLocation(currentEditorMarker); // unify location format

  useEffect(() => {
    if (
      searchLocation &&
      typeof searchLocation.lat === 'number' &&
      typeof searchLocation.lng === 'number'
    ) {
      setCurrentEditorMarker((current) => ({
        ...current,
        lat: searchLocation.lat,
        lng: searchLocation.lng,
      }));
      if (onChange) {
        onChange({
          name: fieldName,
          value: { lat: searchLocation.lat, lng: searchLocation.lng },
        });
      }
    }
  }, [searchLocation]);

  let [currentCenter, setCurrentCenter] = useState(center);

  useEffect(() => {
    if (centerOnEditorMarker && currentEditorMarker.lat) {
      setCurrentCenter({ ...currentEditorMarker });
    } else {
      setCurrentCenter(center);
    }
  }, [currentEditorMarker, center, centerOnEditorMarker]);

  function updateLocation(
    e: LeafletMouseEvent & { isInArea: boolean },
    map: any
  ) {
    if (map && e.isInArea) {
      if (onChange) {
        const value = `{"lat":${e.latlng?.lat},"lng":${e.latlng?.lng}}`;
        onChange({ name: fieldName, value: JSON.parse(value) });
      }
      setCurrentEditorMarker({
        ...currentEditorMarker,
        lat: e.latlng?.lat,
        lng: e.latlng?.lng,
      });
    }
  }

  function removeMarker() {
    setCurrentEditorMarker({
      lat: undefined,
      lng: undefined,
      icon: undefined,
      doNotCluster: true,
    });
    if (onChange) {
      onChange({ name: fieldName, value: {} });
    }
  }

  return (
    <>
      <BaseMap
        {...props}
        center={currentCenter}
        markers={[currentEditorMarker]}
        onClick={updateLocation}
        onMarkerClick={removeMarker}
        zoomAfterInit={false}
        autoZoomAndCenter="area"
        panToLocation={searchLocation}
      />

      <input
        name={fieldName}
        required={fieldRequired}
        type="hidden"
        value={
          typeof currentEditorMarker.lat === 'number' &&
          typeof currentEditorMarker.lng === 'number'
            ? `{"lat":${currentEditorMarker.lat},"lng":${currentEditorMarker.lng}}`
            : ''
        }
      />
    </>
  );
};

EditorMap.loadWidget = loadWidget;
export { EditorMap };
