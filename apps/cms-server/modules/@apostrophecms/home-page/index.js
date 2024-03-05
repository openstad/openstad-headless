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
            'openstad-iconSection': {},
            'openstad-image': {},
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
