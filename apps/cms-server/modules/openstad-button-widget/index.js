module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Button'
  },
  fields: {
    add: {
      direction: {
        type: 'select',
        label: 'Weergave',
        def: 'row',
        choices: [
          {
            label: 'Naast elkaar',
            value: 'row'
          },
          {
            label: 'Onder elkaar',
            value: 'column'
          }
        ]
      },
      buttons: {
        label: 'Buttons',
        type: 'array',
        draggable: true,
        fields: {
          add: {
            label: {
              label: 'Label',
              type: 'string'
            },
            href: {
              label: 'Url',
              type: 'string'
            },
            appearance: {
              type: 'select',
              label: 'Variant',
              def: 'primary-action-button',
              choices: [
                {
                  label: 'primary-action-button',
                  value: 'primary-action-button'
                },
                {
                  label: 'secondary-action-button',
                  value: 'secondary-action-button'
                },
                {
                  label: 'default-button',
                  value: 'default-button'
                },
                {
                  label: 'subtle-button',
                  value: 'subtle-button'
                }
              ]
            }
          }
        }
      }
    },
  }
};
