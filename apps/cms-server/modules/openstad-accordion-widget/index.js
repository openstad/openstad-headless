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
    label: 'Accordion',
  },
  fields: {
    add: {
      headingLevel: {
        type: 'select',
        label: 'Heading level',
        choices: [
          { value: 1, label: 'H1' },
          { value: 2, label: 'H2' },
          { value: 3, label: 'H3' },
          { value: 4, label: 'H4' },
          { value: 5, label: 'H5' },
          { value: 6, label: 'H6' },
        ],
        def: 2,
      },
      label: {
        type: 'string',
        label: 'Titel',
      },
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
