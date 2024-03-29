import type { PropsWithChildren } from 'react';
import { loadWidget } from '../../lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import parseLocation from './lib/parse-location';

import 'leaflet/dist/leaflet.css';
import './css/base-map.css';

import type { MarkerProps } from './types/marker-props';
import type {ResourceDetailMapWidgetProps} from './types/resource-detail-map-widget-props';
import { BaseMap } from './base-map';

const ResourceDetailMap = ({
  resourceId = undefined,
  marker = undefined,
  markerIcon = undefined,
  center = undefined,
  ...props
}: PropsWithChildren<ResourceDetailMapWidgetProps>) => {

  props.zoom ||= 15;

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
    config: { api: props.api },
  });

  const urlParams = new URLSearchParams(window.location.search);
  resourceId =
    resourceId || ( urlParams.get('openstadResourceId')
      ? (urlParams.get('openstadResourceId') as string)
      : undefined );

  const {
    data: resource,
    error,
    isLoading,
  } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  let currentMarker: MarkerProps;
  currentMarker = {
    ...marker,
    location: { ...resource.location } || undefined,
    icon: marker?.icon || markerIcon,
  };
  parseLocation(currentMarker); // unify location format

  let currentCenter = center;
  if (resource?.location) {
    currentCenter = { ...resource.location };
  }

  return (
    <>
      <BaseMap {...props} center={currentCenter} markers={[currentMarker]} />
    </>
  );
};

ResourceDetailMap.loadWidget = loadWidget;

export { ResourceDetailMap };
