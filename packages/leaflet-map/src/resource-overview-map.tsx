import { PropsWithChildren } from 'react';
import {loadWidget} from '../../lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';

import 'leaflet/dist/leaflet.css';
import './css/base-map.less';

import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { MarkerProps } from './types/marker-props';
import { MarkerIcon } from './types/marker-icon';
import { MapPropsType } from './types/index';

import { BaseMap } from './base-map';

export type ResourceOverviewMapWidgetProps =
  BaseProps &
  ProjectSettingProps &
  MapPropsType & {
    marker: MarkerProps,
    markerIcon: MarkerIcon,
  };

export function ResourceOverviewMap({
  markers = undefined,
  markerIcon = undefined,
  center = undefined,

  ...props
}: PropsWithChildren<ResourceOverviewMapWidgetProps>) {

  props.clustering = props.clustering || {};
  props.clustering.isActive = typeof props.clustering?.isActive == 'undefined' ? false : props.clustering.isActive;

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
    config: { api: props.api },
  });

  const [resources] = datastore.useResources({
    projectId: props.projectId,
  });

  let currentMarkers = resources?.map( resource => ({
    location: resource.location? {
	    lat: resource.location.lat,
	    lng: resource.location.lng,
    } : undefined,
  }));

  return (
    <>
      <BaseMap {...props} markers={currentMarkers}/>
    </>
  );

}

ResourceOverviewMap.loadWidget = loadWidget;

export default ResourceOverviewMap;
