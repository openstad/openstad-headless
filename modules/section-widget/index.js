
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
        label: 'Paragraph (P)'
      },
      {
        tag: 'h3',
        label: 'Heading 3 (H3)'
      },
      {
        tag: 'h4',
        label: 'Heading 4 (H4)'
      }
    ]
  },
  '@apostrophecms/image': {},
  '@apostrophecms/video': {},
  agenda: {},
  title: {},
  list: {},
  link: {},
  'info-bar': {},
  'ideas-on-map': {}
};

// modules/two-column-widget/index.js
module.exports = {
  extend: '@apostrophecms/widget-type',
  // 👇 The widget type's field schema
  fields: {
    add: {
      displayType: {
        name: 'displayType',
        label: 'Columns',
        type: 'select',
        help: 'Select the number of columns and their relative width',
        required: true,
        choices: [
          {
            label: 'Full page width ',
            value: 'full-width'
          },
          {
            label: 'One column: 100%',
            value: 'columns-one'
          },
          {
            label: 'Two Columns: 50% - 50%',
            value: 'columns-half'
          },
          {
            label: 'Two Columns: 33% - 66%',
            value: 'columns-onethird'
          },
          {
            label: 'Two Columns: 66% - 33%',
            value: 'columns-twothird-onethird'
          },
          {
            label: 'Two Columns: 75% - 25%',
            value: 'columns-twothird-full'
          },
          {
            label: 'Two Columns: 25% - 75%',
            value: 'columns-onefourth'
          },
          {
            label: 'Two Columns: Desktop: 75% - 25%, Tablet:  66% - 33%',
            value: 'columns-twothird'
          },
          {
            label: 'Three Columns: 25% - 50% - 25%',
            value: 'columns-onefourth-half'
          },
          {
            label: 'Three columns: 33% - 33% - 33%',
            value: 'columns-three'
          },
          {
            label: 'Four Columns: 25% - 25% - 25% - 25%',
            value: 'columns-four'
          },
          {
            label: 'Full screen (vertical & horizontal)',
            value: 'full-screen'
          },
          {
            label: 'Dashboard',
            value: 'dashboard'
          }
          /*  {
                  label: 'icons',
                  value: 'icons',
                }, */
        ]
      },
      area1: {
        name: 'area1',
        type: 'area',
        label: 'Area 1',
        options: {
          widgets: contentWidgets,
          contextual: true
        }
      },
      area2: {
        name: 'area2',
        type: 'area',
        label: 'Area 2',
        contextual: true,
        options: {
          widgets: contentWidgets
        }
      },
      area3: {
        name: 'area3',
        type: 'area',
        label: 'Area 3',
        contextual: true,
        options: {
          widgets: contentWidgets
        }
      },
      area4: {
        name: 'area4',
        type: 'area',
        label: 'Area 4',
        contextual: true,
        options: {
          widgets: contentWidgets
        }
      }
    }
  }
};
