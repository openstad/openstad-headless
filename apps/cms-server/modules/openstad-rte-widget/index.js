const { linkRichTextContent } = require('../../lib/link-rich-text-content');

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
      'orderedList',
    ],
    styles: [
      {
        tag: 'p',
        label: 'Paragraph (P)',
      },
      {
        tag: 'h1',
        label: 'Heading 1 (H1)',
      },
      {
        tag: 'h2',
        label: 'Heading 2 (H2)',
      },
      {
        tag: 'h3',
        label: 'Heading 3 (H3)',
      },
      {
        tag: 'h4',
        label: 'Heading 4 (H4)',
      },
    ],
  },
};

module.exports = {
  extend: 'base-widget',
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
        max: 1,
      },
    },
  },
  extendMethods(self) {
    return {
      async output(_super, req, widget, options, _with) {
        const content = linkRichTextContent(self.apos, widget.text);
        const linkedWidget = {
          ...widget,
          text: {
            ...widget.text,
            items: [{ ...(widget.text?.items?.[0] || {}), content }],
          },
        };
        return _super(req, linkedWidget, options, _with);
      },
    };
  },
};
