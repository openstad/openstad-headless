import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResourceOverviewWithMapWidgetProps, ResourceOverviewWithMap } from './resourceOverviewWithMap';

const config: ResourceOverviewWithMapWidgetProps = {
    displayType: 'cardgrid',
    tagGroups: [{ type: 'theme', label: 'Thema', multiple: true }],
    displayTitle: true,
    displayDescription: true,
    displaySummary: true,
    titleMaxLength: 100,
    summaryMaxLength: 200,
    descriptionMaxLength: 300,
    displayShareButtons: true,
    displayVote: true,
    displayArguments: true,
    displayTagFilters: true,
    displaySearch: true,
    displaySorting: true,
    allowFiltering: true,
    displayBanner: true,
    api: {
      url: import.meta.env.VITE_API_URL,
    },
    projectId: import.meta.env.VITE_PROJECT_ID || 2,
    login: {
      url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID
        }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
    },
    resourceId: import.meta.env.VITE_RESOURCE_ID || 1,
    tilesVariant: import.meta.env.VITE_TILES_VARIANT,
    markers: undefined,
    autoZoomAndCenter: 'markers',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResourceOverviewWithMap {...config} />
  </React.StrictMode>
);
