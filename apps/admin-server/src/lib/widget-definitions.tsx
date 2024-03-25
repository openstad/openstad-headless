export const WidgetDefinitions = {
  agenda: 'Agenda',
  comments: 'Argumenten',
  begrootmodule: 'Begrootmodule',
  enquete: 'Enquete',
  basemap: 'Base map',
  editormap: 'Editor map',
  resourcesmap: 'Resource map',
  resourcedetailmap: 'Resource detail map',
  counter: 'Counter',
  datecountdownbar: 'Date countdown bar',
  keuzewijzer: 'Keuzewijzer',
  likes: 'Like',
  rawresource: 'Raw resource',
  resourcedetail: 'Resource detail',
  resourceform: 'Resource form',
  resourceoverview: 'Resource overview',
  resourcewithmap: 'Resource with map'
};

export type WidgetDefinition = keyof typeof WidgetDefinitions;
