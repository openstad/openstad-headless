export const WidgetDefinitions = {
  agenda: {
    name: 'Agenda',
    description: 'Een tijdlijn van aankomende gebeurtenissen',
    image: '/widget_preview/agenda_preview.png',
  },
  choiceguide: {
    name: 'Keuzewijzer',
    description:
      'Een vragenlijst waarbij je directe gevolgen kunt communiceren van je keuzes.',
    image: '/widget_preview/keuzewijzer_preview.png',
  },
  choiceguideResults: {
    name: 'Keuzewijzer resultaat',
    description: 'Toon de resultaten van de keuzewijzer',
    image: '/widget_preview/keuzewijzerresultaten-preview.png',
  },
  comments: {
    name: 'Reacties',
    description: 'Reageer op inzendingen van inwoners, en reageer op elkaar',
    image: '/widget_preview/arguments_preview.png',
  },
  begrootmodule: {
    name: 'Begrootmodule',
    description: 'Laat inwoners stemmen op basis van budget of aantallen',
    image: '/widget_preview/begrootmodule_preview.png',
  },
  simplevoting: {
    name: 'Stemmodule',
    description:
      'De versimpelde begrootmodule - richt snel een stemproject in.',
    image: '/widget_preview/stemmodule_preview.png',
  },
  enquete: {
    name: 'Enquête',
    description: 'Maak een vragenlijst zonder in te hoeven loggen',
    image: '/widget_preview/enquete_preview.png',
  },
  resourcesmap: {
    name: 'Inzending overzicht kaart',
    description: 'Kaart met een overzicht van inzendingen',
    image: '/widget_preview/resource_map_preview.png',
  },
  resourcedetailmap: {
    name: 'Resource detail map',
    description: 'Kaart met details van een specifieke inzending',
    image: '/widget_preview/resource_map_preview.png',
  },
  counter: {
    name: 'Teller',
    description: 'Een teller die verschillende variabelen kan tellen',
    image: '/widget_preview/counter_preview.png',
  },
  datecountdownbar: {
    name: 'Aftelbalk',
    description: 'Een aftellende klok tot een bepaalde deadline',
    image: '/widget_preview/date_count_down_preview.png',
  },
  // keuzewijzer: {
  //   name: 'Keuzewijzer',
  //   description: 'Decision guide module',
  //   image: '/widget_preview/keuzewijzer_preview.png',
  // },
  likes: {
    name: 'Like',
    description: 'Laat je steun zien! Eenvoudig stemmen met likes.',
    image: '/widget_preview/likes-preview.png',
  },
  rawresource: {
    name: 'Inzending maatwerk',
    description: '',
    image: '/widget_preview/raw_resource_preview.png',
  },
  resourcedetail: {
    name: 'Inzending detailpagina',
    description: 'De details van een specifieke inzending',
    image: '/widget_preview/resource_detail_preview.png',
  },
  resourceform: {
    name: 'Inzending',
    description:
      'Laat inwoners inzendingen versturen die openbaar getoond kunnen worden',
    image: '/widget_preview/resource_form_preview.png',
  },
  resourceoverview: {
    name: 'Inzending overzicht tegels',
    description: 'Een overzicht van alle inzendingen',
    image: '/widget_preview/resource_overview_preview.png',
  },
  resourcewithmap: {
    name: 'Interactieve kaart',
    description:
      'Toon bewonersinzendingen op een kaart, en laad kaartlagen in.',
    image: '/widget_preview/resource_with_map_preview.png',
  },
  resourcedetailwithmap: {
    name: 'Inzending interactieve kaart',
    description: 'Toon de details van een inzending met een kaart',
    image: '/widget_preview/resource_detail_with_map_preview.png',
  },
  documentmap: {
    name: 'Interactieve afbeelding',
    description: 'Reageer op een afbeelding door er markers op te plaatsen',
    image: '/widget_preview/documents_with_comments_preview.png',
  },
  account: {
    name: 'Accountgegevens',
    description: 'Laat inwoners hun eigen gegevens inzien en bewerken',
    image: '/widget_preview/account_preview.png',
  },
  activity: {
    name: 'Gebruikersactiviteit',
    description: 'Laat inwoners hun eigen gegevens inzien en bewerken',
    image: '/widget_preview/activity_preview.png',
  },
  distributionmodule: {
    name: 'Verdeel module',
    description: 'Verdeel budgetten en punten',
    image: '/widget_preview/verdeelmodule-preview.png',
  },
  multiprojectresourceoverview: {
    name: 'Multi project inzending overzicht',
    description:
      'Toon inzendingen en project-tegels van verschillende projecten in één widget.',
    image: '/widget_preview/multiproject-inzendingenoverzicht-preview.png',
  },
  // videoSlider: {
  //   name: 'Video Slider',
  //   description: 'Module voor het tonen van een video slider',
  //   image: '/widget_preview/video_slider_preview.png',
  // },
};

export type WidgetDefinition = keyof typeof WidgetDefinitions;

// export const WidgetDefinitions = {
//   agenda: 'Agenda',
//   comments: 'Reacties',
//   begrootmodule: 'Begrootmodule',
//   simplevoting: 'Stemmodule',
//   enquete: 'Enquete',
//   resourcesmap: 'Resource overview map',
//   resourcedetailmap: 'Resource detail map',
//   counter: 'Counter',
//   datecountdownbar: 'Date countdown bar',
//   keuzewijzer: 'Keuzewijzer',
//   likes: 'Like',
//   rawresource: 'Raw resource',
//   resourcedetail: 'Resource detail',
//   resourceform: 'Resource form',
//   resourceoverview: 'Resource overview',
//   resourcewithmap: 'Resource with map',
//   resourcedetailwithmap: 'Resource detail with map',
//   documentmap: 'Documents with comments',
//   account: 'Account gegevens',
// };

// export type WidgetDefinition = keyof typeof WidgetDefinitions;
