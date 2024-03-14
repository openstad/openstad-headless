import type { PropsWithChildren } from 'react';
import { loadWidget } from '../../lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import parseLocation from './lib/parse-location';

import 'leaflet/dist/leaflet.css';
import './css/base-map.css';

import type { MarkerProps } from './types/marker-props';
import type { CategoriesType } from './types/categorize';
import type {ResourceOverviewMapWidgetProps} from './types/resource-overview-map-widget-props'
import { BaseMap } from './base-map';

const ResourceOverviewMap = ({
  categorize = undefined,
  ...props
}: PropsWithChildren<ResourceOverviewMapWidgetProps>) => {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
    config: { api: props.api },
  });

  const { data: resources } = datastore.useResources({
    projectId: props.projectId,
  });

  const allResources = resources?.records || [];

  let categorizeByField = categorize?.categorizeByField;
  let categories: CategoriesType =  {};

  if (categorizeByField) {
    const { data: tags } = datastore.useTags({
      projectId: props.projectId,
      type: categorizeByField,
    });
    if (Array.isArray(tags) && tags.length) {
      categories = {};
      tags.forEach((tag: any) => {
        // TODO: types/Tag does not exist yet
        categories[tag.name] = {
          color: tag.backgroundColor,
          icon: tag.mapIcon,
        };
      });
    }
  }

  let currentMarkers =
    allResources.map((resource: any) => {
      // TODO: types/resource does not exist yet
      let marker: MarkerProps = {
        location: { ...resource.location } || undefined,
      };
      const markerLatLng = parseLocation(marker); // unify location format
      marker.lat = markerLatLng.lat;
      marker.lng = markerLatLng.lng;

      if (marker.lat && marker.lng && categorizeByField && categories) {
        let tag = resource.tags?.find((t: any) => t.type == categorizeByField); // TODO: types/Tag does not exist yet
        if (tag) {
          marker.data = { [categorizeByField]: tag.name };
        }
      }
      return marker;
    }) || [];

  return (
    <BaseMap
      {...props}
      categorize={{ categories, categorizeByField }}
      markers={currentMarkers}
    />
  );
};

ResourceOverviewMap.loadWidget = loadWidget;
export { ResourceOverviewMap };
