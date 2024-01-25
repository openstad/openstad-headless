// @todo: add all widgets
module.exports = {
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
    js: ['@openstad-headless/resource-detail/dist/resource-detail.iife.js'],
    css: ['@openstad-headless/resource-detail/dist/style.css'],
    functionName: 'OpenstadHeadlessResourceDetail',
    componentName: 'ResourceDetail',
    defaultConfig: {
      projectId: null,
    },
  },
};
