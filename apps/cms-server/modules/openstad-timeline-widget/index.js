module.exports = {
  extend: '@apostrophecms/widget-type',
  options: { label: 'Tijdlijn' },
  fields: {
    add: {
      items: {
        name: 'items',
        label: 'Items',
        type: 'array',
        titleField: 'title',
        fields: {
          add: {
            title: {
              type: 'string',
              label: 'Title',
              help: 'For example: \'March 8th\''
            },
            actionText: {
              type: 'string',
              label: 'Description'
            },
            period: {
              type: 'select',
              label: 'Period or moment',
              help: 'A period (from one point to another point in time) and a moment (one point in time) have a different visualisation',
              choices: [
                {
                  value: 'period',
                  label: 'Period'
                },
                {
                  value: 'moment',
                  label: 'Moment'
                }
              ]
            },
            links: {
              name: 'links',
              type: 'array',
              titleField: 'title',
              fields: {
                add: {
                  title: {
                    label: 'Link title',
                    type: 'string'
                  },
                  url: {
                    label: 'Link URL',
                    type: 'string'
                  },
                  openInNewWindow: {
                    type: 'boolean',
                    label: 'Open in new window?'
                  }
                }
              }
            }
          }
        }
      }
    },
    group: {
      generalGroup: {
        label: 'General',
        fields: [ 'items' ]
      },
      stylingGroup: {
        label: 'Styling',
        fields: [ 'containerStyles' ]
      }
    }
  }
};
