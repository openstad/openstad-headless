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
