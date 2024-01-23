// @todo: add all widgets
module.exports = {

  likes: {
    js: ['@openstad-headless/likes/dist/likes.iife.js'],
    css: ['@openstad-headless/likes/dist/style.css'],
    functionName: 'OpenstadHeadlessLikes',
    componentName: 'Likes',
    defaultConfig: {
      resourceId: null,
    },
  },

  comments: {
    js: ['@openstad-headless/comments/dist/comments.iife.js'],
    css: ['@openstad-headless/comments/dist/style.css'],
    functionName: 'OpenstadHeadlessComments',
    componentName: 'Comments',
    defaultConfig: {
      resourceId: null,
    },
  },

  resourceoverview: {
    js: ['@openstad-headless/resource-overview/dist/resource-overview.iife.js'],
    css: ['@openstad-headless/resource-overview/dist/style.css'],
    functionName: 'OpenstadHeadlessResourceOverview',
    componentName: 'ResourceOverview',
    defaultConfig: {
      projectId: null,
    },
  },

  resourcedetail: {
    js: ['@openstad-headless/resource-detail/dist/resource-detail.iife.js'],
    css: ['@openstad-headless/resource-detail/dist/style.css'],
    functionName: 'OpenstadHeadlessResourceDetail',
    componentName: 'ResourceDetail',
    defaultConfig: {
      projectId: null,
    },
  },

  basemap: {
    js: ['@openstad-headless/leaflet-map/dist/base-map/base-map.iife.js'],
    css: ['@openstad-headless/leaflet-map/dist/base-map/style.css'],
    functionName: 'OpenstadHeadlessBaseMap',
    componentName: 'BaseMap',
    defaultConfig: {
      resourceId: null,
    },
  },

  editormap: {
    js: ['@openstad-headless/leaflet-map/dist/editor-map/editor-map.iife.js'],
    css: ['@openstad-headless/leaflet-map/dist/editor-map/style.css'],
    functionName: 'OpenstadHeadlessEditorMap',
    componentName: 'EditorMap',
    defaultConfig: {
      resourceId: null,
    },
  },

  resourceoverviewmap: {
    js: ['@openstad-headless/leaflet-map/dist/resource-overview-map/resource-overview-map.iife.js'],
    css: ['@openstad-headless/leaflet-map/dist/resource-overview-map/style.css'],
    functionName: 'OpenstadHeadlessResourceOverviewMap',
    componentName: 'ResourceOverviewMap',
    defaultConfig: {
      resourceId: null,
    },
  },

  resourcedetailmap: {
    js: ['@openstad-headless/leaflet-map/dist/resource-detail-map/resource-detail-map.iife.js'],
    css: ['@openstad-headless/leaflet-map/dist/resource-detail-map/style.css'],
    functionName: 'OpenstadHeadlessResourceDetailMap',
    componentName: 'ResourceDetailMap',
    defaultConfig: {
      resourceId: null,
    },
  },

};
