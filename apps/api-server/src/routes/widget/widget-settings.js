// @todo: add all widgets
module.exports = {
  agenda: {
    js: ['@openstad-headless/agenda/dist/agenda.iife.js'],
    css: ['@openstad-headless/agenda/dist/style.css'],
    functionName: 'OpenstadHeadlessAgenda',
    componentName: 'Agenda',
    defaultConfig: {
      resourceId: null,
    },
  },
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
};
