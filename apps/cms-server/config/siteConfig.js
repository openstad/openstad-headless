const path = require('path');
const contentWidgets = require('./contentWidgets');
const palette = require('./palette');
const resourcesSchema = require('./resources.js').schemaFormat;

module.exports = {
  get: (shortName, siteData, assetsIdentifier) => {
 
    
    const siteConfig = {
      shortName: shortName,
      prefix: siteData.sitePrefix ? '/' + siteData.sitePrefix : false,
      modules: {
        '@apostrophecms/rich-text-widget': {
          options: {
            className: 'bp-rich-text'
          }
        },
        '@apostrophecms/image-widget': {
          options: {
            className: 'bp-image-widget'
          }
        },
        '@apostrophecms/video-widget': {
          options: {
            className: 'bp-video-widget'
          }
        },
        // `asset` supports the project's webpack build for client-side assets.
        asset: {},
        // The project's first custom page type.
        'default-page': {},
      },
    };
    
    return siteConfig;
  }
};
