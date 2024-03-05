/**
 * A widget for display a title with static content
 */

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Titel'
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Titel'
      },
      mode: {
        type: 'select',
        label: 'Selecteer een type weergave',
        def: 'h1',
        choices: [
          {
            label: 'Heading 1',
            value: 'h1'
          },
          {
            label: 'Heading 2',
            value: 'h2'
          },
          {
            label: 'Heading 3',
            value: 'h3'
          },
          {
            label: 'Heading 4',
            value: 'h4'
          }
        ]
      },
      className: {
        type: 'select',
        label: 'Select HTML styling class',
        def: 'headerDefault',
        choices: [
          {
            label: 'Normaal',
            value: 'header-default'
          },
          {
            label: 'Extra vet',
            value: 'heavy-bold'
          }
        ]
      },
      classNameCustom: {
        type: 'string',
        label: 'CSS class'
      },
      buttons: {
        label: 'Buttons',
        type: 'array',
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
                }
              ]
            }
          }
        }
      }
    },
    group: {
      generalGroup: {
        label: 'General',
        fields: [ 'title', 'mode' ]
      },
      stylingGroup: {
        label: 'Styling',
        fields: [ 'className', 'classNameCustom', 'containerStyles', 'cssHelperClasses' ]
      }
    }
  }
};
