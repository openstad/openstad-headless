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
  'openstad-component': {},
  'openstad-section': {},
  'openstad-title': {},
  'openstad-accordion': {},
  'openstad-timeline': {},
  'openstad-image': {},
};

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Sectie'
  },
  fields: {
    add: {

      displayType: {
        name: 'displayType',
        label: 'Columns',
        type: 'select',
        help: 'Select the number of columns and their relative width',
        required: true,
        def: 'columns-twothird-onethird',
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
          /*  {
                  label: 'icons',
                  value: 'icons',
                }, */
        ]
      },
      column1: {
        name: 'column1',
        type: 'area',
        label: 'Kolom 1',
        contextual: true,
        options: {
          widgets: contentWidgets,
          contextual: true
        }
      },
      column2: {
        name: 'column2',
        type: 'area',
        label: 'Kolom 2',
        contextual: true,
        options: {
          widgets: contentWidgets
        },
        if: {
          $or: [
            { displayType: 'columns-half' },
            { displayType: 'columns-onethird' },
            { displayType: 'columns-twothird-onethird' },
            { displayType: 'columns-twothird-full' },
            { displayType: 'columns-onefourth' },
            { displayType: 'columns-twothird' },
            { displayType: 'columns-onefourth-half' },
            { displayType: 'columns-three' },
            { displayType: 'columns-four' },
          ]
        },
      },
      column3: {
        name: 'column3',
        type: 'area',
        label: 'Kolom 3',
        contextual: true,
        options: {
          widgets: contentWidgets
        },
        if: {
          $or: [
            { displayType: 'columns-onefourth-half' },
            { displayType: 'columns-three' },
            { displayType: 'columns-four' },
          ]
        },
      },
      column4: {
        name: 'column4',
        type: 'area',
        label: 'Kolom 4',
        contextual: true,
        options: {
          widgets: contentWidgets
        },
        if: {
          $or: [
            { displayType: 'columns-four' },
          ]
        },
      },

      backgroundColor: {
        type: 'color',
        label: 'Achtergrond',
      },

    },

    group: {
      basics: {
        label: 'Algemene instellingen',
        fields: [ 'displayType' ],
      },
      styles: {
        label: 'Vormgeving',
        fields: [ 'backgroundColor' ],
      },
    }

  }
};
