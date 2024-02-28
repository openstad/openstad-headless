import React from 'react';
import ReactDOM from 'react-dom/client';
import { Agenda } from './agenda.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Agenda
      tagTypes={[
        {
          type: 'theme',
          placeholder: 'Selecteer een thema',
          multiple: true,
        },
        { type: 'area', placeholder: 'Selecteer een gebied' },
        { type: 'tag', placeholder: 'Selecteer een tag' },
      ]}
      items={[
        {
          trigger: "trigger1",
          title: "28 februari 2024",
          description: "This is a leap year day in 2024.",
          active: false,
          links: [
            {
              trigger: "linkTrigger1",
              title: "linkTitle 1",
              url: "http://example.com",
              openInNewWindow: true
            },
            {
              trigger: "linkTrigger1",
              title: "linkTitle 2",
              url: "http://example.com",
              openInNewWindow: true
            },
          ]
        },
        {
          trigger: "trigger2",
          title: "29 februari 2024",
          description: "This is the second leap year day in 2024.",
          active: true
        },
        {
          trigger: "trigger3",
          title: "1 maart 2024",
          description: "This is the third leap year day in 2024.",
          active: false
        }
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
