import React from 'react';
import ReactDOM from 'react-dom/client';
import { SwipeProps, SwipeField } from './swipe.js';

const config: SwipeProps = {
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
  cards: [
    {
      id: "0",
      title: "Card Title 1",
      infoField: "Additional Info",
      image: "https://picsum.photos/seed/260/1920/1080",
      explanationRequired: false,
    },
    {
      id: "1",
      title: "Card Title 2",
      infoField: "Additional Info",
      image: "https://picsum.photos/seed/392/1920/1080",
      explanationRequired: false,
    },
    {
      id: "2",
      title: "Card Title 3",
      infoField: "Additional Info",
      image: "https://picsum.photos/seed/990/1920/1080",
      explanationRequired: false,
    },
    {
      id: "3",
      title: "Card Title 4",
      infoField: "Additional Info",
      image: "https://picsum.photos/seed/306/1920/1080",
      explanationRequired: false,
    },
    {
      id: "4",
      title: "Card Title 5",
      infoField: "Additional Info",
      image: "https://picsum.photos/seed/761/1920/1080",
      explanationRequired: false,
    },
    {
      id: "5",
      title: "Card Title 6",
      infoField: "Additional Info",
      image: "https://picsum.photos/seed/563/1920/1080",
      explanationRequired: false,
    },

  ]
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="openstad" style={{ height: '100vh' }}>
      <SwipeField {...config} />
    </div>
  </React.StrictMode>
);
