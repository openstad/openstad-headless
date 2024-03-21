/**
 * A widget for display a title with static content
 */

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Share Links'
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Titel'
      },
  
    },
  }
};
