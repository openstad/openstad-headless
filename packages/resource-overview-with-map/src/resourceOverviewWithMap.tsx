import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React, { useState } from 'react';
import './resourceOverviewWithMap.css';
import {
  ResourceOverview,
  ResourceOverviewWidgetProps
} from '../../resource-overview/src/resource-overview.js';

import { ResourceOverviewMap } from '@openstad-headless/leaflet-map/src/resource-overview-map.js';
import { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';


export type ResourceOverviewWithMapWidgetProps = ResourceOverviewWidgetProps & ResourceOverviewMapWidgetProps;

const ResourceOverviewWithMap = (props: ResourceOverviewWithMapWidgetProps) => {
    const [filteredResources, setFilteredResources] = useState<any[]>([]);

    return (
        <div className="resourceOverviewWithMap-container">
            <div className="detail-container">
                <ResourceOverview
                    {...props}
                    onFilteredResourcesChange={setFilteredResources} // Pass the callback function
                />
            </div>
            <ResourceOverviewMap
                {...props}
                {...props.resourceOverviewMapWidget}
                givenResources={filteredResources.length > 0 ? filteredResources : undefined}
            />
        </div>
    );
}

ResourceOverviewWithMap.loadWidget = loadWidget;

export { ResourceOverviewWithMap };
