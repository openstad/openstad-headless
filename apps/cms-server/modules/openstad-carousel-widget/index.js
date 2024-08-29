/**
 * A widget for display a title with static content
 */

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Carousel',
  },
  fields: {
    add: {
      title: {
        label: 'Titel van de afbeelding tonen',
        type: 'boolean',
        def: false,
      },
      size: {
        label: 'Hoogte van de afbeeldingen',
        type: 'select',
        def: 'large',
        choices: [
          {
            label: 'Klein',
            value: 'small',
          },
          {
            label: 'Medium',
            value: 'medium',
          },
          {
            label: 'Groot',
            value: 'large',
          },
          {
            label: 'Automatisch (afbeelding bepaalt hoogte)',
            value: 'autoHeight',
          }
        ],
      },
      fit: {
        label: 'Afbeeldingen schalen',
        type: 'select',
        def: 'cover',
        choices: [
          {
            label: 'cover',
            value: 'cover',
          },
          {
            label: 'contain',
            value: 'contain',
          },
        ],
      
      },
      images: {
        label: 'Afbeeldingen',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/image': {},
          },
        },
      },
    },
  },
};
