import React from 'react';
import ReactDOM from 'react-dom/client';
import { Likes } from './likes.js';

const config = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID,
  ideaId: import.meta.env.VITE_IDEA_ID,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID}/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`
  },
  votes: {
    isActive: true,
    requiredUserRole: 'member',
    voteType: 'likes',
    voteValues: [
      {
        label: 'Like',
        value: 'yes'
      }
    ]
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Likes
      projectId="2"
      ideaId="1"
      config={config}
    />
  </React.StrictMode>
);
