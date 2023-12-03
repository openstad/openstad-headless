/**
 * Widget for displaying lists in several types of styling with static content
 */

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: { label: 'List' },
  fields: {
    add: {
      items: {
        label: 'Items',
        type: 'array',
        titleField: 'item',
        fields: {
          add: {
            item: {
              type: 'string',
              label: 'Item'
            },
            subitems: {
              name: 'subitems',
              label: 'Subitems',
              type: 'array',
              titleField: 'subitem',
              fields: {
                add: {
                  type: 'string',
                  name: 'subitem',
                  label: 'Subitem'
                }
              }
            },
            subListType: {
              type: 'select',
              label: 'Select type of list',
              choices: [
                {
                  label: 'Unordered list',
                  value: 'ul'
                },
                {
                  label: 'Ordered list',
                  value: 'ol'
                }
              ]
            },
            subListClassName: {
              type: 'select',
              label: 'Select appearance modus for subitems',
              choices: [
                {
                  label: 'Bullets',
                  value: 'uk-list uk-list-bullet'
                },
                {
                  label: 'Checkmarks with blue background',
                  value: 'checkmark-list'
                },
                {
                  label: 'Blue Checkmarks',
                  value: 'checkmark-blue-list'
                },
                {
                  label: 'Stripes',
                  value: 'uk-list uk-list-striped'
                },
                {
                  label: 'Numbers',
                  value: 'uk-list uk-list-numbers'
                }
              ]
            }
          }
        }
      },
      listType: {
        type: 'select',
        label: 'Select type of list',
        choices: [
          {
            label: 'Unordered list',
            value: 'ul'
          },
          {
            label: 'Ordered list',
            value: 'ol'
          }
        ]
      },
      listClassName: {
        type: 'select',
        label: 'Select appearance modus for list',
        choices: [
          {
            label: 'Bullets',
            value: 'uk-list uk-list-bullet'
          },
          {
            label: 'Checkmarks with blue background',
            value: 'checkmark-list'
          },
          {
            label: 'Blue Checkmarks',
            value: 'checkmark-blue-list'
          },
          {
            label: 'Stripes',
            value: 'uk-list uk-list-striped'
          },
          {
            label: 'Numbers',
            value: 'uk-list uk-list-numbers'
          }
        ]
      }
    },
    group: {
      generalGroup: {
        label: 'General',
        fields: [ 'items' ]
      },
      stylingGroup: {
        label: 'Styling',
        fields: [
          'listType',
          'listClassName',
          'containerStyles'
        ]
      }
    }
  }
};
