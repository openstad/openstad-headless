// @todo: add all widgets
module.exports = {
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
  rawresource: {
    packageName: '@openstad-headless/raw-resource',
    directory: 'raw-resource',
    js: ['@dist/raw-resource.iife.js'],
    css: ['@dist/style.css'],
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
    js: ['@openstad-headless/date-countdown-bar/dist/date-countdown-bar.iife.js'],
    css: ['@openstad-headless/date-countdown-bar/dist/style.css'],
    functionName: 'OpenstadHeadlessDateCountdownBar',
    componentName: 'DateCountdownBar',
    defaultConfig: {
      projectId: null,
    },
  }
};
