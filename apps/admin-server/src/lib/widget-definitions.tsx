export const WidgetDefinitions = {
  agenda: 'Agenda',
  comments: 'Reacties',
  begrootmodule: 'Begrootmodule',
  simplevoting: 'Stemmodule',
  enquete: 'Enquete',
  resourcesmap: 'Resource overview map',
  resourcedetailmap: 'Resource detail map',
  counter: 'Counter',
  datecountdownbar: 'Date countdown bar',
  keuzewijzer: 'Keuzewijzer',
  likes: 'Like',
  rawresource: 'Raw resource',
  resourcedetail: 'Resource detail',
  resourceform: 'Resource form',
  resourceoverview: 'Resource overview',
  resourcewithmap: 'Resource with map',
  resourcedetailwithmap: 'Resource detail with map',
  documentmap: 'Documents with comments',
  account: 'Account gegevens',
};

export type WidgetDefinition = keyof typeof WidgetDefinitions;
