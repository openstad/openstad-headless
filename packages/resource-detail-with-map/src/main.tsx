import React from 'react';
import ReactDOM from 'react-dom/client';
import {ResourceDetailWithMap} from './resourceDetailWithMap';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResourceDetailWithMap
      tagTypes={[
        {
          type: 'theme',
          placeholder: 'Selecteer een thema',
          multiple: true,
        },
        { type: 'area', placeholder: 'Selecteer een gebied' },
        { type: 'tag', placeholder: 'Selecteer een tag' },
      ]}
      api={{
        url: import.meta.env.VITE_API_URL,
      }}
      projectId={ import.meta.env.VITE_PROJECT_ID }
      resourceId={import.meta.env.VITE_RESOURCE_ID}
      resourceIdRelativePath={import.meta.env.VITE_RESOURCE_ID_RELATIVE_PATH}
    />
  </React.StrictMode>
);
