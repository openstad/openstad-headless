import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  StemBegroot,
StemBegrootWidgetProps} from './stem-begroot.js';

const config: StemBegrootWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${
      import.meta.env.VITE_PROJECT_ID
    }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  },
  maxBudget:43241
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StemBegroot {...config} />
  </React.StrictMode>
);
