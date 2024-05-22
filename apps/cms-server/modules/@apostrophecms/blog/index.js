module.exports = {
  fields: {
    add: {
      content: {
        type: 'area',
        options: {
          widgets: {
            'openstad-section': {},
          },
        },
      },
      image: {
        type: 'attachment',
        label: 'Upload an Image',
        options: {
          uploadDir: '/uploads/images',
          image: true,
        },
      },
      summary: {
        type: 'string',
        textarea: true,
        label: 'Korte samenvatting (Wordt gebruikt op de blog overzicht pagina)',
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['content'],
      },
      extraInfo: {
        label: 'Details',
        fields: ['image', 'summary'],
      },
    },
  },
};
