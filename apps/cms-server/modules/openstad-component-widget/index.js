// const styleSchema = require('../../../config/styleSchema.js').default;

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Openstad Component Widget'
  },
  fields: {
    add: {
      componentUrl: {
        type: 'string',
        label: 'Url uit de script tag'
      },
    },
    group: {
      general: {
        label: 'General',
        fields: ['uploadedImage']
      },
      styling: {
        label: 'Styling',
        fields: ['imageStyles']
      }
    }
  },
  methods(self) {
    return {
      async load(req, widgets) {
        for (const widget of widgets) {
          if (widget.componentUrl) {
            
          }
        }
      }
    };
  }
};
