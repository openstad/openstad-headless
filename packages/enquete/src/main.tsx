import React from 'react';
import ReactDOM from 'react-dom/client';
import { Enquete } from './enquete.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Enquete
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
