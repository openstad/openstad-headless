// const styleSchema = require('../../../config/styleSchema.js').default;

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Afbeelding',
  },
  fields: {
    add: {
      uploadedImage: {
        type: 'attachment',
        label: 'Afbeelding',
        required: true,
        trash: true,
        svgImages: true,
      },

      uploadedImageTitle: {
        type: 'string',
        label: 'Afbeelding titel',
      },

      uploadedImageAlt: {
        type: 'string',
        label: 'Alternatieve tekst',
      },

      height: {
        type: 'select',
        def: '--small',
        label: 'Hoogte',
        choices: [
          {
            label: 'Extra klein',
            value: '--xsmall',
          },
          {
            label: 'Klein',
            value: '--small',
          },
          {
            label: 'Normaal',
            value: '--normal',
          },
          {
            label: 'Groot',
            value: '--large',
          },
          {
            label: 'Extra groot',
            value: '--xlarge',
          }
        ],
        required: true,
      },

      objectFit: {
        type: 'select',
        def: '--none',
        label: 'Weergave',
        choices: [
          {
            label: 'fill',
            value: '--fill',
          },
          {
            label: 'contain',
            value: '--contain',
          },
          {
            label: 'cover',
            value: '--cover',
          },
          {
            label: 'scale',
            value: '--scale',
          },
          {
            label: 'none',
            value: '--none',
          },
        ],
        required: true,
      },
      banner: {
        type: 'boolean',
        label: 'Witruimte boven weghalen',
        def: false,
      },
    },
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
      },
    };
  },
};
