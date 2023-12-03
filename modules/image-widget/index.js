// const styleSchema = require('../../../config/styleSchema.js').default;

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Image'
  },
  fields: {
    add: {
      uploadedImage: {
        type: 'attachment',
        label: 'Image',
        required: true,
        trash: true,
        svgImages: true
      },
      uploadedImageTitle: {
        type: 'string',
        label: 'Image title'
      },
      uploadedImageAlt: {
        type: 'string',
        label: 'Textual alternative'
      },
      // imageStyles: styleSchema.definition('imageStyles', 'Styles for the image')
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
          if (widget.imageStyles) {
            const imageId = self.apos.util.generateId();
            widget.imageId = imageId;
            // widget.formattedImageStyles = styleSchema.format(imageId, widget.imageStyles);
          }
        }
      }
    };
  }
};