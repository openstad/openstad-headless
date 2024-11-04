export const WidgetDefinitions = {
  agenda: {
    name: 'Agenda',
    description: 'agendamodule',
    image: '/widget_preview/agenda_preview.png',
  },
  choiceguide: {
    name: 'Keuzewijzer',
    description: 'Keuzewijzermodule',
    image: '/widget_preview/keuzewijzer_preview.png',
  },
  choiceguideResults: {
    name: 'Keuzewijzer resultaat',
    description: 'Keuzewijzer resultaat',
    image: '/widget_preview/keuzewijzer_preview.png',
  },
  comments: {
    name: 'Reacties',
    description: 'Reactiemodule',
    image: '/widget_preview/arguments_preview.png',
  },
  begrootmodule: {
    name: 'Begrootmodule',
    description: 'Module voor begroten',
    image: '/widget_preview/begrootmodule_preview.png',
  },
  simplevoting: {
    name: 'Stemmodule',
    description: 'Module om te stemmen',
    image: '/widget_preview/stemmodule_preview.png',
  },
  enquete: {
    name: 'Enquête',
    description: 'Enquête module',
    image: '/widget_preview/enquete_preview.png',
  },
  resourcesmap: {
    name: 'Inzending overzicht kaart',
    description: 'Map showing resource overview',
    image: '/widget_preview/resource_map_preview.png',
  },
  resourcedetailmap: {
    name: 'Resource detail map',
    description: 'Map showing resource details',
    image: '/widget_preview/resource_map_preview.png',
  },
  counter: {
    name: 'Teller',
    description: 'Tellermodule',
    image: '/widget_preview/counter_preview.png',
  },
  datecountdownbar: {
    name: 'Aftelbalk',
    description: 'Balk die aftelt tot een zelf in te stellen datum',
    image: '/widget_preview/date_count_down_preview.png',
  },
  // keuzewijzer: {
  //   name: 'Keuzewijzer',
  //   description: 'Decision guide module',
  //   image: '/widget_preview/keuzewijzer_preview.png',
  // },
  likes: {
    name: 'Like',
    description: 'Likemodule',
    image: '/widget_preview/likes_preview.png',
  },
  rawresource: {
    name: 'Inzending maatwerk',
    description: 'Module for raw resources',
    image: '/widget_preview/raw_resource_preview.png',
  },
  resourcedetail: {
    name: 'Inzending detailpagina',
    description: 'Module showing resource details',
    image: '/widget_preview/resource_detail_preview.png',
  },
  resourceform: {
    name: 'Inzendingformulier',
    description: 'Formulier om inzending informatie op te vragen',
    image: '/widget_preview/resource_form_preview.png',
  },
  resourceoverview: {
    name: 'Inzending overzicht tegels',
    description: 'Overview of resources',
    image: '/widget_preview/resource_overview_preview.png',
  },
  resourcewithmap: {
    name: 'Interactieve kaart',
    description: 'Resource module with map',
    image: '/widget_preview/resource_with_map_preview.png',
  },
  resourcedetailwithmap: {
    name: 'Inzending interactieve kaart',
    description: 'Detailed resource module with map',
    image: '/widget_preview/resource_detail_with_map_preview.png',
  },
  documentmap: {
    name: 'Interactieve afbeelding',
    description: 'Map showing documents with comments',
    image: '/widget_preview/documents_with_comments_preview.png',
  },
  account: {
    name: 'Accountgegevens',
    description: 'Accountdetailmodule',
    image: '/widget_preview/account_preview.png',
  },
  activity: {
    name: 'Gebruikersactiviteit',
    description: 'Module voor gebruikersactiviteit',
    image: '/widget_preview/activity_preview.png',
  },
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
