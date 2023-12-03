/**
 * A widget for display a title with static content
 *
 */

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Title'
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Title '
      },
      mode: {
        type: 'select',
        label: 'Select appearance modus for title',
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
        choices: [
          {
            label: 'Default',
            value: 'headerDefault'
          },
          {
            label: 'Heavy bold',
            value: 'heavyBold'
          }
        ]
      },
      classNameCustom: {
        type: 'string',
        label: 'Set Custom classname'
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
