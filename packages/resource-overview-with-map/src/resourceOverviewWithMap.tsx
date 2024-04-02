import 'remixicon/fonts/remixicon.css';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { loadWidget } from '@openstad-headless/lib/load-widget';
import React from 'react';
import './resourceOverviewWithMap.css';
import {
  ResourceOverview,
  ResourceOverviewWidgetProps,
} from '../../resource-overview/src/resource-overview.js';

import { BaseMapWidgetProps } from '../../leaflet-map/src/base-map.js';

import { ResourceOverviewMapWidgetProps, ResourceOverviewMap } from '../../leaflet-map/src/resource-overview-map.js';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';

const resourceConfig: ResourceOverviewWidgetProps = {
  displayType: 'cardgrid',
  tagGroups: [{ type: 'theme', label: 'Thema', multiple: true }],
  displayTitle: false,
  displayDescription: true,
  displaySummary: true,
  titleMaxLength: 100,
  summaryMaxLength: 200,
  descriptionMaxLength: 300,
  displayShareButtons: true,
  displayVote: true,
  displayArguments: true,
  displayTagFilters: false,
  displaySearch: false,
  displaySorting: false,
  allowFiltering: false,
  displayBanner: false,
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID
      }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  },
};

const config: BaseMapWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  resourceId: import.meta.env.VITE_RESOURCE_ID || 1,
  tilesVariant: import.meta.env.VITE_TILES_VARIANT,
};

let ResourceOverviewConfig:ResourceOverviewMapWidgetProps = {
  ...config,
  markers: undefined,
  tilesVariant: 'nlmaps',
  autoZoomAndCenter: 'markers',
  clustering: {
    isActive: true,
  },
  categorize: {
    categorizeByField: 'theme',
  },
}

export type ResourceOverviewWithMapWidgetProps = BaseProps &
ProjectSettingProps & {
  displayType: string;
  tagGroups: { type: string; label: string; multiple: boolean }[];
  displayTitle: boolean;
  displayDescription: boolean;
  displaySummary: boolean;
  titleMaxLength: number;
  summaryMaxLength: number;
  descriptionMaxLength: number;
  displayShareButtons: boolean;
  displayVote: boolean;
  displayArguments: boolean;
  displayTagFilters: boolean;
  displaySearch: boolean;
  displaySorting: boolean;
  allowFiltering: boolean;
  displayBanner: boolean;
  api: {
    url: string;
  };
  projectId: string;
  login: {
    url: string;
  };
  markers: string;
  tilesVariant: string;
  autoZoomAndCenter: string;
  clustering: { isActive: boolean };
  categorize: { categorizeByField: string };  
};

const ResourceOverviewWithMap = () => {
  return (
    <div className="resourceOverviewWithMap-container">
      <ResourceOverview {...resourceConfig} />
      <ResourceOverviewMap {...ResourceOverviewConfig}/>
    </div>
  );
}

ResourceOverviewWithMap.loadWidget = loadWidget;

export { ResourceOverviewWithMap };
