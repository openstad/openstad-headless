/**
 * A widget for display a title with static content
 */

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Carousel'
  },
  fields: {
    add: {
      images: {
        label: 'Photo',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/image': {}
          }
        }
      },
    },
  }
};
