import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  ResourceOverview,
  ResourceOverviewWidgetProps,
} from './resource-overview.js';

const config: ResourceOverviewWidgetProps = {
  tagGroups: [{ type: 'theme', label: 'Thema', multiple: true }],
  displayPagination: true,
  displayTitle: true,
  displayDescription: true,
  displaySummary: true,
  titleMaxLength: 100,
  summaryMaxLength: 200,
  descriptionMaxLength: 300,
  displayShareButtons: true,
  displayVote: true,
  displayArguments: true,
  displayTagFilters: true,
  displaySearch: true,
  displaySorting: true,
  allowFiltering: true,
  displayBanner: true,
  bannerText: 'Dit is een title',
  displayStatusLabel: true,
  displayVariant: 'compact',
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 2,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${
      import.meta.env.VITE_PROJECT_ID
    }/login?forceNewLogin=1&useAuth=default&redirectUri=${document.location}`,
  },
  displayType: import.meta.env.VITE_DISPLAY_TYPE || 'cardgrid',
  itemLink: import.meta.env.VITE_ITEM_LINK,
  sorting: [
    { value: 'createdAt_desc', label: 'Nieuwste eerst' },
    { value: 'createdAt_asc', label: 'Oudste eerst' },
  ],
  rawInput:
        "<h1>Plan:</h1>" +
        "<b>Title:</b>{{ title | replace('Lorem', 'Florem') }}<br />" +
        "<em>Resource:</em>{{ resource | dump }}<br />" +
        "{% if resource.viewableByRole = 'all' %}Iedereen mag dit zien!{% else %}Niet iedereen mag dit zien helaas.{% endif %}<br />" +
        "{% if resource.startDateHumanized %}Datum: {{ resource.startDateHumanized }}{% endif %}<br />" +
        "{% if resource.location.lat %}Breedtegraad: {{ resource.location.lat }}{% endif %}<br />"
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ResourceOverview {...config} />
  </React.StrictMode>
);
