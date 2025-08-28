/**
 * A widget for display a title with static content
 */

module.exports = {
  extend: 'base-widget',
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
