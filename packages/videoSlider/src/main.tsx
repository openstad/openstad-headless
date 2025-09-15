import React from 'react';
import ReactDOM from 'react-dom/client';
import { VideoSliderProps, VideoSlider } from './videoSlider.js';

const config: VideoSliderProps = {
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
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="openstad">
    <VideoSlider {...config} />
    </div>
  </React.StrictMode>
);
