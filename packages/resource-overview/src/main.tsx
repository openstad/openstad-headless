import React from 'react';
import ReactDOM from 'react-dom/client';
import Widget from './widget.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Widget
      projectId="2"
      config={{
        api: {
          url: import.meta.env.VITE_API_URL,
        },
        projectId: import.meta.env.VITE_PROJECT_ID,
        ideaId: import.meta.env.VITE_IDEA_ID,
      }}
      resources={['dsaf', 's', 's']}
    />
  </React.StrictMode>
);
