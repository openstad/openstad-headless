import React from 'react';
import ReactDOM from 'react-dom/client';
import ResourceOverview from './resource-overview.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResourceOverview
      tagTypes={[
        {
          type: 'theme',
          placeholder: 'Selecteer een thema',
          multiple: true,
        },
        { type: 'area', placeholder: 'Selecteer een gebied' },
        { type: 'tag', placeholder: 'Selecteer een tag' },
      ]}
      config={{
        api: {
          url: import.meta.env.VITE_API_URL,
        },
        projectId: import.meta.env.VITE_PROJECT_ID,
        resourceId: import.meta.env.VITE_RESOURCE_ID,
      }}
    />
  </React.StrictMode>
);
