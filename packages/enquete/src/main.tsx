import React from 'react';
import ReactDOM from 'react-dom/client';
import { Enquete, EnqueteWidgetProps } from './enquete.js';

const config: EnqueteWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID,
  resourceId: import.meta.env.VITE_RESOURCE_ID,
  login: {
    label: import.meta.env.VITE_LOGIN_LABEL,
    url: `${import.meta.env.VITE_API_URL}/auth/project/${
      import.meta.env.VITE_PROJECT_ID
    }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  },
};
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Enquete {...config} />
  </React.StrictMode>
);
