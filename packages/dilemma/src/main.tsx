import React from 'react';
import ReactDOM from 'react-dom/client';
import { DilemmaProps, DilemmaField } from './dilemma.js';

const config: DilemmaProps = {
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
  title: "Wat heb je het <i>liefst</i> in jouw buurt?",
  infoField: "Lorem amet voluptate consequat sunt nulla culpa quis. Voluptate consequat, sunt nulla culpa quis proident. Nulla culpa quis proident ea do id. Quis proident ea do id minim. Ea do, id minim laboris.",
  options: [
    {
        id: 0,
        title: "Bredere fietspaden",
        description: "Maar dan verdwijnt er groen in je buurt.",
        image: "http://localhost:31450/image/3a0633fdd232e1ac1f1e08407cab8df7"
    },
    {
        id: 1,
        title: "Meer groen",
        description: "Maar dan worden de fietspaden smaller.",
        image: "http://localhost:31450/image/04dd2ef237a685b9adf8a66f5be30427"
    }
]
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="openstad" style={{height: '100vh'}}>
    <DilemmaField {...config} />
    </div>
  </React.StrictMode>
);
