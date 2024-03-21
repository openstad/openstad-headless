import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResourceOverviewWithMapWidgetProps, ResourceOverviewWithMap } from './resourceOverviewWithMap.js';

const config: ResourceOverviewWithMapWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  resourceId: import.meta.env.VITE_RESOURCE_ID || 1,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${
      import.meta.env.VITE_PROJECT_ID
    }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResourceOverviewWithMap {...config} />
  </React.StrictMode>
);
