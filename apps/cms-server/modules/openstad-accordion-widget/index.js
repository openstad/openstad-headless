module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Accordion'
  },
  fields: {
    add: {
      label: {
        type: 'string',
        label: 'Titel'
      },
      content: {
        type: 'string',
        label: 'Content',
        textarea: true,
      }
    },
    group: {
      generalGroup: {
        label: 'General',
        fields: [ 'title', 'content' ]
      }
    }
  }
};
