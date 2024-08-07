import React from 'react';
import ReactDOM from 'react-dom/client';
import { StemBegroot, StemBegrootWidgetProps } from './stem-begroot.js';

const config: StemBegrootWidgetProps = {
  api: {
    url: import.meta.env.VITE_API_URL,
  },
  projectId: import.meta.env.VITE_PROJECT_ID || 5,
  login: {
    url: `${import.meta.env.VITE_API_URL}/auth/project/${
      import.meta.env.VITE_PROJECT_ID
    }/login?forceNewLogin=1&useAuth=default&redirectUri=${encodeURIComponent(
      document.location.toString()
    )}`,
  },
  step1:
    'Kies uit onderstaand overzicht jouw favoriete plannen. Selecteer voor maximaal 200.000 aan plannen. In stap 3 vul je ter controle de stemcode in die je per post hebt ontvangen. Tot slot verstuur je in stap 4 je stem.',
  step2:
    'Bekijk hieronder je selectie. Ben je tevreden? Klik dan onderaan door naar stap 3 om jouw stemcode in te vullen.',
  step3:
    'Via onderstaande knop kun je op een aparte pagina je persoonlijke stemcode invullen. Wij controleren de stemcode op geldigheid. Als dat gelukt is kom je terug op deze pagina waarna je kunt stemmen. Alle bewoners van Centrum hebben per post een stemcode ontvangen.',
  step3success:
    'Het controleren van je stemcode is gelukt! Je bent bijna klaar. Klik op onderstaande knop om je stem te versturen.',
  thankMessage:
    'Bedankt voor het stemmen! De stemperiode loopt van 9 september t/m 6 oktober 2019. Wil je weten welke plannen het vaakst zijn gekozen en uitgevoerd worden? De uitslag wordt op 15 oktober 2019 gepubliceerd op centrumbegroot.amsterdam.nl.',
  voteMessage: 'Gelukt, je hebt gestemd!',
  showOriginalResource: true,
  originalResourceUrl: '/test/[id]',
  displayPriceLabel: true,
  showVoteCount: true,

  votes: {
    isViewable: true,
    mustConfirm: false,
    requiredUserRole: 'member',
    voteValues: [],
    maxResources: 4,
    minResources: 1,
    minBudget: 100,
    maxBudget: 80000,
    isActive: true,
    voteType: 'count',
    withExisting: 'error',
  },
  displayTagFilters: true,
  displaySearch:true,
  tagGroups: [
    { type: 'status', label: 'Status', multiple: false },
    { type: 'area', label: 'Gebied', multiple: false },
    { type: 'theme', label: 'Thema', multiple: false },
  ],
  showInfoMenu: true,
  isSimpleView: false,
  step1Title: 'Uw selecties',
  resourceCardTitle: 'Selecteer een plan',
  step2Title: 'Overzicht van mijn selectie',
  stemCodeTitle: 'Vul je stemcode in',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StemBegroot {...config} />
  </React.StrictMode>
);
