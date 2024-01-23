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
  categorize = undefined,

  ...props
}: PropsWithChildren<ResourceOverviewMapWidgetProps>) {

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
    config: { api: props.api },
  });

  const [resources] = datastore.useResources({
    projectId: props.projectId,
  });

  let categorizeByField = categorize?.categorizeByField
  let categories;
  if (categorizeByField) {
    const [tags] = datastore.useTags({
      projectId: props.projectId,
      type: categorizeByField,
    });
    if (tags.length) {
      categories = {};
      tags.map(tag =>{
        categories[ tag.name ] = {
          color: tag.backgroundColor,
          icon: tag.mapIcon,
        }
      });
    }
  }

  let currentMarkers = resources?.map( resource => {
    let marker = {
      location: resource.location? {
	      lat: resource.location.lat,
	      lng: resource.location.lng,
      } : undefined,
    }
    if (marker.location && categorizeByField && categories) {
      let tag = resource.tags?.find( tag => tag.type == categorizeByField );
      if (tag) {
        marker.data = { [categorizeByField]: tag.name };
      }
    }
    return marker;
  });

  return (
    <BaseMap {...props} markers={currentMarkers} categorize={{ categorizeByField, categories }}/>
  );

}

ResourceOverviewMap.loadWidget = loadWidget;

export default ResourceOverviewMap;
