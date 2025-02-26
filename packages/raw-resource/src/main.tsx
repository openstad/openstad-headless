import React from 'react';
import ReactDOM from 'react-dom/client';
import { RawResource } from './raw-resource.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RawResource
      tagTypes={[
        {
          type: 'theme',
          placeholder: 'Selecteer een thema',
          multiple: true,
        },
        { type: 'area', placeholder: 'Selecteer een gebied' },
        { type: 'tag', placeholder: 'Selecteer een tag' },
      ]}
      api={{ url: import.meta.env.VITE_API_URL as string }}
      projectId={ import.meta.env.VITE_PROJECT_ID as string}
      resourceId={ import.meta.env.VITE_RESOURCE_ID as string}
      rawInput={
        "<h1>Plan:</h1>" +
        "<b>Title:</b>{{ title | replace('Lorem', 'Florem') }}<br />" +
        "<em>Resource:</em>{{ resource | dump }}<br />" +
        "{% if resource.viewableByRole = 'all' %}Iedereen mag dit zien!{% else %}Niet iedereen mag dit zien helaas.{% endif %}<br />" +
        "{% if resource.startDateHumanized %}Datum: {{ resource.startDateHumanized }}{% endif %}<br />" +
        "{% if resource.location.lat %}Breedtegraad: {{ resource.location.lat }}{% endif %}<br />"
    }
    />
  </React.StrictMode>
);
