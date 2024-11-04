import { useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import type { LeafletMouseEvent } from 'leaflet';
import { loadWidget } from '../../lib/load-widget';
import parseLocation from './lib/parse-location';

import 'leaflet/dist/leaflet.css';
import './css/base-map.css';

import type { MarkerProps } from './types/marker-props';
import type {EditorMapWidgetProps} from './types/editormap-widget-props';
import { BaseMap } from './base-map';
import React from 'react';


const EditorMap = ({
  fieldName = 'location',
  centerOnEditorMarker = true,
  editorMarker = undefined,
  markerIcon = undefined,
  center = undefined,
  markers = [],
  onChange,
  fieldRequired = false,
  ...props
}: PropsWithChildren<EditorMapWidgetProps>) => {
  let [currentEditorMarker, setCurrentEditorMarker] = useState<MarkerProps>({
    ...editorMarker,
    icon: editorMarker?.icon || markerIcon,
    doNotCluster: true,
  });
  parseLocation(currentEditorMarker); // unify location format

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
        onChange({name: fieldName, value: JSON.parse(value)})
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
      onChange({ name: fieldName, value: '' });
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
      />

      <input
        name={fieldName}
        required={fieldRequired}
        type="hidden"
        value={`{"lat":${currentEditorMarker.lat},"lng":${currentEditorMarker.lng}}`}
      />
    </>
  );
};

EditorMap.loadWidget = loadWidget;
export { EditorMap };
