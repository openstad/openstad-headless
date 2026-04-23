module.exports = {
  fields: {
    add: {
      top: {
        type: 'area',
        label: 'Secties boven berichten',
        options: {
          widgets: {
            'openstad-section': {},
          },
        },
      },
      bottom: {
        type: 'area',
        label: 'Secties onder berichten',
        options: {
          widgets: {
            'openstad-section': {},
          },
        },
      },
    },
    group: {
      basics: {
        label: 'Basics',
        fields: ['title', 'top', 'bottom'],
      },
    },
  },
};
