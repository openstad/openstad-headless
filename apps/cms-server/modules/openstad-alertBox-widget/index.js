/**
 * A widget for display a title with static content
 */

module.exports = {
  extend: 'base-widget',
  options: {
    label: 'Alert Box',
  },
  fields: {
    add: {
      message: {
        type: 'string',
        label: 'Content',
      },
    },
  },
};
