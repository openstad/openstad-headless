import React from 'react';
import ReactDOM from 'react-dom/client';
import { ActivityProps, Activity } from './activity.js';

const config: ActivityProps = {
  currentSite: [
    {
      title: 'Resource 1',
      site: 'site title',
      description: 'Amet veniam aute laborum ea. Aute laborum, ea pariatur. Pariatur enim elit exercitation do. Elit exercitation do duis excepteur reprehenderit veniam. Do duis excepteur, reprehenderit. Reprehenderit veniam, nostrud commodo. Commodo duis proident, aute commodo elit sint. Aute commodo elit sint. Elit sint ad qui.',
      date: new Date(2022, 5, 15).toISOString(),
      label: 'Reactie'
    },
    {
      title: 'Resource 2',
      site: 'site title',
      description: 'Labore ea consequat aliquip ipsum nostrud sint. Consequat, aliquip ipsum nostrud sint lorem quis. Nostrud sint lorem quis eiusmod. Lorem, quis eiusmod do. Do lorem labore tempor, qui amet anim voluptate. Tempor qui amet anim, voluptate sit. Anim voluptate sit do veniam excepteur, ullamco. Do veniam excepteur ullamco anim, nisi elit. Ullamco anim, nisi elit fugiat duis. Elit fugiat duis labore consectetur sed qui aliqua.',
      date: new Date(2022, 11, 25).toISOString(),
      label: 'Reactie'
    },
    {
      title: 'Resource 3',
      site: 'site title',
      description: 'Ullamco incididunt quis qui magna laborum aute. Quis qui magna laborum aute minim. Magna laborum aute, minim enim aliqua pariatur sint. Minim, enim aliqua pariatur sint officia in velit. Pariatur, sint officia in. In, velit veniam sed.',
      date: new Date(2023, 2, 10).toISOString(),
      label: 'Plan toegevoegd'
    },
    {
      title: 'Resource 4',
      site: 'site title',
      description: 'Laborum occaecat, lorem laboris. Laboris elit dolore labore nostrud. Dolore labore nostrud incididunt. Nostrud incididunt aliqua commodo nostrud pariatur esse eu. Aliqua commodo nostrud pariatur, esse eu. Pariatur esse eu fugiat officia exercitation. Eu fugiat, officia exercitation eiusmod amet aute sed.',
      date: new Date(2023, 7, 20).toISOString(),
      label: 'Stem uitgebracht'
    },
  ]
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Activity {...config} />
  </React.StrictMode>
);
