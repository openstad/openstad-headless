/**
 * Widget for displaying buttons or links in different styles with static content
 */
module.exports = {
  extend: '@apostrophecms/widget-type',
  options: { label: 'Link or button' },
  fields: {
    add: {
      label: {
        type: 'string',
        label: 'Label',
        required: true
      },
      screenReaderInfo: {
        type: 'string',
        label: 'Screen reader info (will be added after the label)'
      },
      url: {
        type: 'url',
        label: 'URL',
        required: true
      },
      icon: {
        type: 'attachment',
        label: 'Icon',
        required: false,
        trash: true
      },
      iconAltText: {
        type: 'string',
        label: 'Alt text for the icon'
      },
      targetBlank: {
        type: 'boolean',
        label: 'Open in new window'
      },
      onlyForModerator: {
        label: 'Only show to moderators',
        type: 'boolean',
        choices: [
          {
            label: 'Yes',
            value: true
          },
          {
            label: 'No',
            value: false
          }
        ],
        def: false
      },
      style: {
        type: 'select',
        choices: [
          {
            label: 'No style',
            value: 'no-styling'
          },
          {
            label: 'Link with back icon',
            value: 'link-caret--back-black'
          },
          {
            label: 'List style Link',
            value: 'link-caret--blue'
          },
          {
            label: 'Link box',
            value: 'link-box'
          },
          {
            label: 'Filled button',
            value: 'filled-button'
          },
          {
            label: 'Outlined button',
            value: 'outlined-button'
          },
          {
            label: 'Next button',
            value: 'next-button'
          }
        ],
        label: 'Type of style',
        required: true
      },
      classNameCustom: {
        type: 'string',
        label: 'Set Custom classname'
      },
      addTelephoneProtocol: {
        type: 'boolean',
        label: 'Add telephone protocol to link (tel:)'
      }

    },
    group: {
      generalGroup: {
        label: 'General',
        fields: [
          'label',
          'url'
        ]
      },
      stylingGroup: {
        label: 'Styling',
        fields: [
          'icon',
          'iconAltText',
          'style',
          'containerStyles'
        ]
      },
      advancedGroup: {
        label: 'Advanced',
        fields: [
          'targetBlank',
          'classNameCustom',
          'addTelephoneProtocol',
          'onlyForModerator'
        ]
      }
    }
  }
};
