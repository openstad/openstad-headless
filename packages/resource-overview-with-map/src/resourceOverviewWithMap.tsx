import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React, {useState} from 'react';
import './resourceOverviewWithMap.css';
import {
  ResourceOverview,
  ResourceOverviewWidgetProps
} from '../../resource-overview/src/resource-overview.js';

import { ResourceOverviewMap } from '@openstad-headless/leaflet-map/src/resource-overview-map.js';
import { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import {PostcodeAutoFillLocation} from "@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter";


export type ResourceOverviewWithMapWidgetProps = ResourceOverviewWidgetProps & ResourceOverviewMapWidgetProps;

const ResourceOverviewWithMap = (props: ResourceOverviewWithMapWidgetProps) => {
    const [filteredResources, setFilteredResources] = useState<any[]>([]);
    const [location, setLocation] = useState<PostcodeAutoFillLocation>(undefined);

    const handleLocationChange = (newLocation: PostcodeAutoFillLocation) => {
      if (
        JSON.stringify(newLocation) !== JSON.stringify(location)
      ) {
        setLocation(newLocation);
      }
    }

    const handleFilteredResourcesChange = (newFilteredResources: any[]) => {
      if (
        JSON.stringify(newFilteredResources) !== JSON.stringify(filteredResources)
      ) {
        setFilteredResources(newFilteredResources);
      }
    }

    return (
        <div className="map-wrapper">
            <div className="resourceOverviewWithMap-container">
                <div className="detail-container">
                    <ResourceOverview
                        {...props}
                        onFilteredResourcesChange={handleFilteredResourcesChange}
                        onLocationChange={handleLocationChange}
                        displayMap={false}
                    />
                </div>
                <ResourceOverviewMap
                    {...props}
                    {...props.resourceOverviewMapWidget}
                    givenResources={filteredResources.length > 0 ? filteredResources : undefined}
                    locationProx={location}
                />
        </div>
        </div>
    );
}

ResourceOverviewWithMap.loadWidget = loadWidget;

export { ResourceOverviewWithMap };
