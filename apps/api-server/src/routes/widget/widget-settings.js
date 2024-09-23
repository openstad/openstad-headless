// @todo: add all widgets MUST confirm to widgetDefinition for key
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
    packageName: '@openstad-headless/leaflet-map',
    directory: 'leaflet-map',
    js: ['dist/base-map/base-map.iife.js'],
    css: ['dist/base-map/style.css'],
    functionName: 'OpenstadHeadlessBaseMap',
    componentName: 'BaseMap',
    defaultConfig: {
      projectId: null,
    },
  },
  choiceguide: {
    packageName: '@openstad-headless/choiceguide',
    directory: 'choiceguide',
    js: ['dist/choiceguide.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessChoiceGuide',
    componentName: 'ChoiceGuide',
    defaultConfig: {
      projectId: null,
    },
  },
  choiceguideResults: {
    packageName: '@openstad-headless/choiceguide-results',
    directory: 'choiceguide-results',
    js: ['dist/choiceguide-results.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessChoiceGuideResults',
    componentName: 'ChoiceGuideResults',
    defaultConfig: {
      projectId: null,
    },
  },
  editormap: {
    packageName: '@openstad-headless/leaflet-map',
    directory: 'leaflet-map',
    js: ['dist/editor-map/editor-map.iife.js'],
    css: ['dist/editor-map/style.css'],
    functionName: 'OpenstadHeadlessEditorMap',
    componentName: 'EditorMap',
    defaultConfig: {
      projectId: null,
    },
  },
  resourcesmap: {
    packageName: '@openstad-headless/leaflet-map',
    directory: 'leaflet-map',
    js: ['dist/resource-overview-map/resource-overview-map.iife.js'],
    css: ['dist/resource-overview-map/style.css'],
    functionName: 'OpenstadHeadlessResourceOverviewMap',
    componentName: 'ResourceOverviewMap',
    defaultConfig: {
      projectId: null,
    },
  },
  resourcedetailmap: {
    packageName: '@openstad-headless/leaflet-map',
    directory: 'leaflet-map',
    js: ['dist/resource-detail-map/resource-detail-map.iife.js'],
    css: ['dist/resource-detail-map/style.css'],
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
  },
  simplevoting: {
    packageName: '@openstad-headless/simple-voting',
    directory: 'simple-voting',
    js: ['dist/simple-voting.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessSimpleVoting',
    componentName: 'SimpleVoting',
    defaultConfig: {
      projectId: null
    }
  },
  resourcewithmap: {
    packageName: '@openstad-headless/resource-overview-with-map',
    directory: 'resource-overview-with-map',
    js: ['dist/resource-overview-with-map.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessResourceOverviewWithMap',
    componentName: 'ResourceOverviewWithMap',
    defaultConfig: {
      projectId: null,
    },
  },
  resourcedetailwithmap: {
    packageName: '@openstad-headless/resource-detail-with-map',
    directory: 'resource-detail-with-map',
    js: ['dist/resource-detail-with-map.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessResourceDetailWithMap',
    componentName: 'ResourceDetailWithMap',
    defaultConfig: {
      projectId: null,
    },
  },
  documentmap: {
    packageName: '@openstad-headless/document-map',
    directory: 'document-map',
    js: ['dist/document-map.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessDocumentMap',
    componentName: 'DocumentMap',
    defaultConfig: {
      projectId: null,
    },
  },
  activity: {
    packageName: '@openstad-headless/activity',
    directory: 'activity',
    js: ['dist/activity.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessActivity',
    componentName: 'Activity',
    defaultConfig: {
      projectId: null,
    },
  },
  account: {
    packageName: '@openstad-headless/account',
    directory: 'account',
    js: ['dist/account.iife.js'],
    css: ['dist/style.css'],
    functionName: 'OpenstadHeadlessAccount',
    componentName: 'Account',
    defaultConfig: {
      projectId: null,
    },
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
