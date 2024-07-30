export const WidgetDefinitions = {
  agenda: {
    name: 'Agenda',
    description: 'agenda module',
    image: '/widget_preview/agenda_preview.png',
  },
  comments: {
    name: 'Reacties',
    description: 'Reactie module',
    image: '/widget_preview/arguments_preview.png',
  },
  begrootmodule: {
    name: 'Begrootmodule',
    description: 'Module for budgeting',
    image: '/widget_preview/begrootmodule_preview.png',
  },
  simplevoting: {
    name: 'Stemmodule',
    description: 'Simple voting module',
    image: '/widget_preview/stemmodule_preview.png',
  },
  enquete: {
    name: 'Enquete',
    description: 'Survey module',
    image: '/widget_preview/enquete_preview.png',
  },
  resourcesmap: {
    name: 'Resource overview map',
    description: 'Map showing resource overview',
    image: '/widget_preview/resource_overview_preview.png',
  },
  resourcedetailmap: {
    name: 'Resource detail map',
    description: 'Map showing resource details',
    image: 'https://dummyimage.com/600x400/f4f4f4/000',
  },
  counter: {
    name: 'Counter',
    description: 'Counter module',
    image: '/widget_preview/counter_preview.png',
  },
  datecountdownbar: {
    name: 'Date countdown bar',
    description: 'Bar showing countdown to a date',
    image: '/widget_preview/date_count_down_preview.png',
  },
  keuzewijzer: {
    name: 'Keuzewijzer',
    description: 'Decision guide module',
    image: 'https://dummyimage.com/600x400/f4f4f4/000',
  },
  likes: {
    name: 'Like',
    description: 'Like module',
    image: 'https://dummyimage.com/600x400/f4f4f4/000',
  },
  rawresource: {
    name: 'Raw resource',
    description: 'Module for raw resources',
    image: 'https://dummyimage.com/600x400/f4f4f4/000',
  },
  resourcedetail: {
    name: 'Resource detail',
    description: 'Module showing resource details',
    image: '/widget_preview/resource_detail_preview.png',
  },
  resourceform: {
    name: 'Resource form',
    description: 'Form for resource input',
    image: '/widget_preview/resource_form_preview.png',
  },
  resourceoverview: {
    name: 'Resource overview',
    description: 'Overview of resources',
    image: '/widget_preview/resource_overview_preview.png',
  },
  resourcewithmap: {
    name: 'Resource with map',
    description: 'Resource module with map',
    image: '/widget_preview/resource_with_map_preview.png',
  },
  resourcedetailwithmap: {
    name: 'Resource detail with map',
    description: 'Detailed resource module with map',
    image: '/widget_preview/resource_detail_with_map_preview.png',
  },
  documentmap: {
    name: 'Documents with comments',
    description: 'Map showing documents with comments',
    image: '/widget_preview/documents_with_comments_preview.png',
  },
  account: {
    name: 'Account gegevens',
    description: 'Account details module',
    image: 'https://dummyimage.com/600x400/f4f4f4/000',
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
