import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  ResourceOverview,
  ResourceOverviewWidgetProps,
} from './resource-overview.js';

const config: ResourceOverviewWidgetProps = {
  tagGroups: [{ type: 'theme', label: 'Thema', multiple: true }],
  displayPagination: true,
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
  displayStatusLabel: true,
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${
      import.meta.env.VITE_PROJECT_ID
    }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  },
  displayType: import.meta.env.VITE_DISPLAY_TYPE || 'cardgrid',
  itemLink: import.meta.env.VITE_ITEM_LINK,
  sorting: [
    { value: 'createdAt_desc', label: 'Nieuwste eerst' },
    { value: 'createdAt_asc', label: 'Oudste eerst' },
  ],
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResourceOverview {...config} />
  </React.StrictMode>
);
