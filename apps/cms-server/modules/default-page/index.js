module.exports = {
  extend: '@apostrophecms/page-type',
  options: {
    label: 'Standaard Pagina'
  },
  fields: {
    add: {
      main: {
        type: 'area',
        options: {
          widgets: {
            'openstad-section': {},
          }
        }
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [
          'title',
          'main'
        ]
      }
    }
  }
};
