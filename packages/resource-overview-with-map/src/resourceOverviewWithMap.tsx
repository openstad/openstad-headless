import 'remixicon/fonts/remixicon.css';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React from 'react';
import './resourceOverviewWithMap.css';
import {
  ResourceOverview,
  ResourceOverviewWidgetProps
} from '../../resource-overview/src/resource-overview.js';

import { ResourceOverviewMap } from '../../leaflet-map/src/resource-overview-map.js';
import { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';


export type ResourceOverviewWithMapProps = ResourceOverviewWidgetProps & ResourceOverviewMapWidgetProps;

const ResourceOverviewWithMap = (props: ResourceOverviewWithMapProps) => {
  return (
    <div className="resourceOverviewWithMap-container">
      <ResourceOverview {...props} />
      <ResourceOverviewMap {...props} />
    </div>
  );
}

ResourceOverviewWithMap.loadWidget = loadWidget;

export { ResourceOverviewWithMap };
