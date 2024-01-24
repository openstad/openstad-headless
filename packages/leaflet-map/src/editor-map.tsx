import { useState, useEffect, PropsWithChildren } from 'react';
import { LeafletMouseEvent } from 'leaflet';
import {loadWidget} from '../../lib/load-widget';

import 'leaflet/dist/leaflet.css';
import './css/base-map.less';

import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { MarkerProps } from './types/marker-props';
import { MarkerIconType } from './types/marker-icon';
import { MapPropsType } from './types/index';

import { BaseMap } from './base-map';

export type EditorMapWidgetProps =
  BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    fieldName: string,
    markerIcon: MarkerIconType,
    editorMarker: MarkerProps,
    centerOnEditorMarker: boolean,
  };

export function EditorMap({
  fieldName = 'location',
  centerOnEditorMarker = true,
  editorMarker = undefined,
  markerIcon = {
    iconUrl : '/img/editor-marker-icon.svg',
    shadowUrl : '/img/marker-shadow.png',
    iconSize : [32,40],
    iconAnchor : [8,40],
  },
  center = undefined,
  markers = [],
  ...props
}: PropsWithChildren<EditorMapWidgetProps>) {

  let [currentEditorMarker, setCurrentEditorMarker] = useState<MarkerProps>({
    location: editorMarker?.location || {
		  lat: editorMarker?.lat,
		  lng: editorMarker?.lng,
    },
    icon: editorMarker?.icon || markerIcon,
    doNotCluster: true,
  });
  let [currentCenter, setCurrentCenter] = useState(center)

  useEffect(() => {
    if (currentEditorMarker?.location?.lat) {
      setCurrentCenter({ ...currentEditorMarker.location })
    } else {
      setCurrentCenter(center)
    }
  }, [currentEditorMarker])

  function updateLocation(e: LeafletMouseEvent & { isInArea: boolean }, map: any) {
    if (map && e.isInArea) {
      setCurrentEditorMarker({
        ...currentEditorMarker,
        location: e.latlng,
      })
    }
  }

  return (
    <>
      <BaseMap {...props} markers={[...markers, currentEditorMarker]} center={currentCenter} onClick={updateLocation}/>
      <input type="hidden" name={fieldName} value={`{"lat":${currentEditorMarker.location.lat},"lng":${currentEditorMarker.location.lng}}`}/>
    </>
  );

}

EditorMap.loadWidget = loadWidget;
