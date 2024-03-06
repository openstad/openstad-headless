// @todo: add all widgets
let moduleDefinitions = {
  agenda: {
    packageName: '@openstad-headless/agenda',
    directory: 'agenda',
    js: ['dist/agenda.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessAgenda',
    componentName: 'Agenda',
    defaultConfig: {
      resourceId: null,
    },
  },
  likes: {
    packageName: '@openstad-headless/likes',
    directory: 'likes',
    js: ['dist/likes.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessLikes',
    componentName: 'Likes',
    defaultConfig: {
      resourceId: null,
    },
  },
  comments: {
    packageName: '@openstad-headless/comments',
    directory: 'comments',
    js: ['dist/comments.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessComments',
    componentName: 'Comments',
    defaultConfig: {
      resourceId: null,
    },
  },
  enquete: {
    packageName: '@openstad-headless/enquete',
    directory: 'enquete',
    js: ['dist/enquete.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessEnquete',
    componentName: 'Enquete',
    defaultConfig: {
      projectId: null,
    },
  },
  rawresource: {
    packageName: '@openstad-headless/raw-resource',
    directory: 'raw-resource',
    js: ['dist/raw-resource.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessRawResource',
    componentName: 'RawResource',
    defaultConfig: {
      projectId: null,
    },
  },
  resourceoverview: {
    packageName: '@openstad-headless/resource-overview',
    directory: 'resource-overview',
    js: ['dist/resource-overview.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessResourceOverview',
    componentName: 'ResourceOverview',
    defaultConfig: {
      projectId: null,
    },
  },
  resourcedetail: {
    packageName: '@openstad-headless/resource-detail',
    directory: 'resource-detail',
    js: ['dist/resource-detail.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessResourceDetail',
    componentName: 'ResourceDetail',
    defaultConfig: {
      projectId: null,
    },
  },
  datecountdownbar: {
    packageName: '@openstad-headless/date-countdown-bar',
    directory: 'date-countdown-bar',
    js: ['dist/date-countdown-bar.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessDateCountdownBar',
    componentName: 'DateCountdownBar',
    defaultConfig: {
      projectId: null,
    },
  },
  counter: {
    packageName: '@openstad-headless/counter',
    directory: 'counter',
    js: ['dist/counter.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessCounter',
    componentName: 'Counter',
    defaultConfig: {
      projectId: null,
    },
  },
  basemap: {
    packageName: '@openstad-headless/base-map',
    directory: 'leaflet-map',
    js: ['dist/base-map.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessBaseMap',
    componentName: 'BaseMap',
    defaultConfig: {
      projectId: null,
    },
  },
  editormap: {
    packageName: '@openstad-headless/editor-map',
    directory: 'leaflet-map',
    js: ['dist/editor-map.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessEditorMap',
    componentName: 'EditorMap',
    defaultConfig: {
      projectId: null,
    },
  },
  resourceoverviewmap: {
    packageName: '@openstad-headless/resource-overview-map',
    directory: 'leaflet-map',
    js: ['dist/resource-overview-map.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessResourceOverviewMap',
    componentName: 'ResourceOverviewMap',
    defaultConfig: {
      projectId: null,
    },
  },
  resourcedetailmap: {
    packageName: '@openstad-headless/resource-detail-map',
    directory: 'leaflet-map',
    js: ['dist/resource-detail-map.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessResourceDetailMap',
    componentName: 'ResourceDetailMap',
    defaultConfig: {
      projectId: null,
    },
  },
  resourceform: {
    packageName: '@openstad-headless/resource-form',
    directory: 'resource-form',
    js: ['dist/resource-form.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessResourceForm',
    componentName: 'ResourceFormWidget',
    defaultConfig: {
      projectId: null,
    },
  },
  begrootmodule: {
    packageName: '@openstad-headless/stem-begroot',
    directory: 'stem-begroot',
    js: ['dist/stem-begroot.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessStemBegroot',
    componentName: 'StemBegroot',
    defaultConfig: {
      projectId: null
    }
  }
};

const requiredKeys = [
  'packageName',
  'directory',
  'js',
  'css',
  'functionName',
  'componentName',
  'defaultConfig',
];

const getWidgetSettings = function () {
  const badDefinitions = {};

  Object.entries(moduleDefinitions).forEach(([widgetKey, definition]) => {
    const keysInDefinition = Object.keys(definition);

    const missingKeys = requiredKeys.filter(
      (requiredKey) => !keysInDefinition.includes(requiredKey)
    );

    if (missingKeys.length > 0) {
      badDefinitions[widgetKey] = missingKeys;
    }
  });

  if (Object.keys(badDefinitions).length > 0) {
    console.error('MISSING FIELDS IN WIDGET DEFINITIONS', badDefinitions);
  }

  return moduleDefinitions;
};

module.exports = getWidgetSettings;
