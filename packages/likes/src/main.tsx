import React from 'react';
import ReactDOM from 'react-dom/client';
import Likes from './likes.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Likes
      projectId="2"
      ideaId="1"
      apiUrl="http://localhost:31410"
      config={{}}
    />
  </React.StrictMode>
);
