import { PropsWithChildren } from 'react';
import {loadWidget} from '../../lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';

import 'leaflet/dist/leaflet.css';
import './css/base-map.less';

import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { MarkerProps } from './types/marker-props';
import { MarkerIconType } from './types/marker-icon';
import { MapPropsType } from './types/index';

import { BaseMap } from './base-map';

export type ResourceDetailMapWidgetProps =
  BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    resourceId: number,
    marker: MarkerProps,
    markerIcon: MarkerIconType,
  };

export function ResourceDetailMap({
  resourceId = undefined,
  marker = undefined,
  markerIcon = undefined,
  center = undefined,
  ...props
}: PropsWithChildren<ResourceDetailMapWidgetProps>) {

  props.zoom ||= 15;
  
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
    config: { api: props.api },
  });

  const urlParams = new URLSearchParams(window.location.search);
  resourceId = resourceId || parseInt( urlParams.get('openstadResourceId') );
  const [resource, resourceError, resourceIsLoading] = datastore.useResource({  // TODO: error handling
    projectId: props.projectId,
    resourceId: resourceId,
  });

  let currentMarker = {
    ...marker,
    location: resource.location? {
	    lat: resource.location.lat,
	    lng: resource.location.lng,
    } : undefined,
    icon: marker?.icon || markerIcon,
  };

  let currentCenter = center;
  if (resource?.location) {
    currentCenter = { ...resource.location }
  }

  return (
    <>
      <BaseMap {...props} markers={[currentMarker]} center={currentCenter}/>
    </>
  );

}

ResourceDetailMap.loadWidget = loadWidget;

export default ResourceDetailMap;
