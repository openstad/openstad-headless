import React from 'react';
import ReactDOM from 'react-dom/client';
import { LikeWidgetProps, Likes } from './likes.js';

const config: LikeWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  resourceId: import.meta.env.VITE_RESOURCE_ID || 1,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID}/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
    anonymous: {
      url: `${import.meta.env.VITE_API_URL}/auth/project/${import.meta.env.VITE_PROJECT_ID}/login?forceNewLogin=1&useAuth=anonymous&redirectUri=${document.location}`,
    },
  },

  votes: {
    isViewable: true,
    maxResources: 10,
    minResources: 0,
    mustConfirm: true,
    withExisting: '',
    isActive: true,
    requiredUserRole: 'anonymous',
    voteType: 'likes',
    voteValues: [
      {
        label: 'Like',
        value: 'yes',
      },
    ],
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Likes {...config} title="Dit is een titel" variant="large" />
  </React.StrictMode>
);
