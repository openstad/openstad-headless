const contentWidgets = {
  '@apostrophecms/rich-text': {
    toolbar: [
      'styles',
      '|',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'bulletList',
      'orderedList'
    ],
    styles: [
      {
        tag: 'p',
        label: 'Paragraph (P)',
      },
      {
        tag: 'h3',
        label: 'Heading 3 (H3)',
      },
      {
        tag: 'h4',
        label: 'Heading 4 (H4)',
      }
    ]
  }
};

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Rich Text Editor',
  },
  fields: {
    add: {
      text: {
        type: 'area',
        options: {
          widgets: contentWidgets,
        },
        max: 1
      },
    },
  },
};
