import type { PropsWithChildren } from 'react';
import { loadWidget } from '../../lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';

import 'leaflet/dist/leaflet.css';
import './css/base-map.css';

import type { MarkerProps } from './types/marker-props';
import type { ResourceDetailMapWidgetProps } from './types/resource-detail-map-widget-props';
import { BaseMap } from './base-map';
import React from 'react';

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
    resourceId ||
    (urlParams.get('openstadResourceId')
      ? (urlParams.get('openstadResourceId') as string)
      : undefined);

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
    icon: {
      iconSize: [24, 24],
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><path d="M2 3H21.1384C21.4146 3 21.6385 3.22386 21.6385 3.5C21.6385 3.58701 21.6157 3.67252 21.5725 3.74807L18 10L21.5725 16.2519C21.7095 16.4917 21.6262 16.7971 21.3865 16.9341C21.3109 16.9773 21.2254 17 21.1384 17H4V22H2V3Z"></path></svg>`,
    },
  };

  let currentCenter = center;
  if (resource?.location) {
    currentCenter = { ...resource.location };
  }

  return (
    <>
      <BaseMap
        {...props}
        clustering={{ isActive: false }}
        center={currentCenter}
        markers={[currentMarker]}
      />
    </>
  );
};

ResourceDetailMap.loadWidget = loadWidget;

export { ResourceDetailMap };
