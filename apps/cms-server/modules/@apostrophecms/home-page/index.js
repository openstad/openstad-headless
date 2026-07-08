module.exports = {
  options: {
    label: 'Home pagina',
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            'openstad-section': {},
          },
        },
      },
      ogImage: {
        type: 'attachment',
        label: 'Afbeelding voor social media (og:image)',
        fileGroup: 'images',
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'main'],
      },
      seo: {
        label: 'Social media',
        fields: ['ogImage'],
      },
    },
  },
};
