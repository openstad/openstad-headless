/**
 * A widget for display a title with static content
 */

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Icon Section'
  },
  fields: {
    add: {
      expandable: {
        label: 'Uitklapbaar',
        type: 'boolean',
        def: true
      },
      expanded: {
        label: 'Standaard uitgeklapt',
        type: 'boolean',
        def: true
      },
      expandablelabel: {
        label: 'Uitklapbaar label',
        type: 'string',
      },
      content: {
        label: 'Card content',
        type: 'array',
        fields: {
          add: {
            image:{
              label: 'Afbeelding',
              type: 'attachment',
              fileGroup: 'images',
            },
            imageAlt: {
              label: 'Afbeelding alt tekst',
              type: 'string'
            },
            title: {
              label: 'Titel',
              type: 'string'
            },
            description: {
              label: 'Omschrijving',
              type: 'string',
              textarea: true
            },
            linkText:{
              label: 'Link tekst',
              type: 'string'
            },
            href: {
              label: 'Link url',
              type: 'url'
            },
            target: {
              label: 'Open link in nieuw venster',
              type: 'boolean',
              def: false
            }
          }
        }
      }
    },
  }
};
