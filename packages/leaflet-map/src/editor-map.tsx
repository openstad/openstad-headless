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
  markerIcon = {
    iconUrl: '/img/editor-marker-icon.svg',
    shadowUrl: '/img/marker-shadow.png',
    iconSize: [32, 40],
    iconAnchor: [8, 40],
  },
  center = undefined,
  markers = [],
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
      setCurrentEditorMarker({
        ...currentEditorMarker,
        lat: e.latlng?.lat,
        lng: e.latlng?.lng,
      });
    }
  }

  return (
    <>
      <BaseMap
        {...props}
        center={currentCenter}
        markers={[...markers, currentEditorMarker]}
        onClick={updateLocation}
      />

      <input
        name={fieldName}
        type="hidden"
        value={`{"lat":${currentEditorMarker.lat},"lng":${currentEditorMarker.lng}}`}
      />
    </>
  );
};

EditorMap.loadWidget = loadWidget;
export { EditorMap };
