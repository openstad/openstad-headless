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
