import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResourceOverview } from './resource-overview.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResourceOverview
      tagTypes={[
       
      ]}
      projectId = {import.meta.env.VITE_PROJECT_ID}
    />
  </React.StrictMode>
);
