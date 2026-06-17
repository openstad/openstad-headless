import { ResourceOverviewMap } from '@openstad-headless/leaflet-map/src/resource-overview-map.js';
import { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { PostcodeAutoFillLocation } from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import React, { useCallback, useRef, useState } from 'react';

import {
  ResourceOverview,
  ResourceOverviewWidgetProps,
} from '../../resource-overview/src/resource-overview.js';
import './resourceOverviewWithMap.css';

export type ResourceOverviewWithMapWidgetProps = ResourceOverviewWidgetProps &
  ResourceOverviewMapWidgetProps;

const ResourceOverviewWithMap = (props: ResourceOverviewWithMapWidgetProps) => {
  const [filteredResources, setFilteredResources] = useState<any[]>([]);
  const [location, setLocation] = useState<PostcodeAutoFillLocation>(undefined);
  const resourceClickHandlerRef = useRef<
    ((resource: any, index?: number) => void) | null
  >(null);

  const opensInDialog = props.displayType === 'cardgrid';

  const handleMarkerClick = useCallback((resource: any, index: number) => {
    resourceClickHandlerRef.current?.(resource, index);
  }, []);

  return (
    <div className="map-wrapper">
      <div className="resourceOverviewWithMap-container">
        <div className="detail-container">
          <ResourceOverview
            {...props}
            onFilteredResourcesChange={setFilteredResources}
            onLocationChange={setLocation}
            onResourceClickHandlerRegister={
              opensInDialog
                ? (handler) => {
                    resourceClickHandlerRef.current = handler;
                  }
                : undefined
            }
            displayMap={false}
          />
        </div>
        <ResourceOverviewMap
          {...props}
          {...props.resourceOverviewMapWidget}
          givenResources={
            filteredResources.length > 0 ? filteredResources : undefined
          }
          noFetch={true}
          locationProx={location}
          onMarkerClick={opensInDialog ? handleMarkerClick : undefined}
        />
      </div>
    </div>
  );
};

ResourceOverviewWithMap.loadWidget = loadWidget;

export { ResourceOverviewWithMap };
