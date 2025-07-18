// @todo: add all widgets MUST confirm to widgetDefinition for key
let moduleDefinitions = {
  agenda: {
    packageName: '@openstad-headless/agenda',
    directory: 'agenda',
    js: ['dist/agenda.iife.js'],
    css: ['dist/agenda.css'],
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
    css: ['dist/likes.css'],
    functionName: 'OpenstadHeadlessLikes',
    componentName: 'Likes',
    defaultConfig: {
      resourceId: null,
    },
  },
  swipe: {
    packageName: '@openstad-headless/swipe',
    directory: 'swipe',
    js: ['dist/swipe.iife.js'],
    css: ['dist/swipe.css'],
    functionName: 'OpenstadHeadlessSwipe',
    componentName: 'Swipe',
    defaultConfig: {
      resourceId: null,
    },
  },
  comments: {
    packageName: '@openstad-headless/comments',
    directory: 'comments',
    js: ['dist/comments.iife.js'],
    css: ['dist/comments.css'],
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
    css: ['dist/enquete.css'],
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
    css: ['dist/raw-resource.css'],
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
    css: ['dist/resource-overview.css'],
    functionName: 'OpenstadHeadlessResourceOverview',
    componentName: 'ResourceOverview',
    defaultConfig: {
      projectId: null,
    },
  },
  multiprojectresourceoverview: {
    packageName: '@openstad-headless/multi-project-resource-overview',
    directory: 'multi-project-resource-overview',
    js: ['dist/multi-project-resource-overview.iife.js'],
    css: ['dist/multi-project-resource-overview.css'],
    functionName: 'OpenstadHeadlessMultiProjectResourceOverview',
    componentName: 'MultiProjectResourceOverview',
    defaultConfig: {
      projectId: null,
    },
  },
  resourcedetail: {
    packageName: '@openstad-headless/resource-detail',
    directory: 'resource-detail',
    js: ['dist/resource-detail.iife.js'],
    css: ['dist/resource-detail.css'],
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
    css: ['dist/date-countdown-bar.css'],
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
    css: ['dist/counter.css'],
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
    css: ['dist/base-map/base-map.css'],
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
    css: ['dist/choiceguide.css'],
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
    css: ['dist/choiceguide-results.css'],
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
    css: ['dist/editor-map/editor-map.css'],
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
    css: ['dist/resource-overview-map/resource-overview-map.css'],
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
    css: ['dist/resource-detail-map/resource-detail-map.css'],
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
    css: ['dist/resource-form.css'],
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
    css: ['dist/stem-begroot.css'],
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
    css: ['dist/simple-voting.css'],
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
    css: ['dist/resource-overview-with-map.css'],
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
    css: ['dist/resource-detail-with-map.css'],
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
    css: ['dist/document-map.css'],
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
    css: ['dist/activity.css'],
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
    css: ['dist/account.css'],
    functionName: 'OpenstadHeadlessAccount',
    componentName: 'Account',
    defaultConfig: {
      projectId: null,
    },
  },
  distributionmodule: {
    packageName: '@openstad-headless/distribution-module',
    directory: 'distribution-module',
    js: ['dist/distribution-module.iife.js'],
    css: ['dist/distribution-module.css'],
    functionName: 'OpenstadHeadlessDistributionModule',
    componentName: 'DistributionModule',
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
