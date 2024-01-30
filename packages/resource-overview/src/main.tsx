import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResourceOverview, ResourceOverviewWidgetProps } from './resource-overview.js';


const config: ResourceOverviewWidgetProps = {
  displayType: 'cardgrid',
  tagGroups:[],
  displayTitle: true,
  displayDescription: true,
  displaySummary: true,
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${
      import.meta.env.VITE_PROJECT_ID
    }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  },
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResourceOverview
     
      {...config}
    />
  </React.StrictMode>
);
