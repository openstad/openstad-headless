// const styleSchema = require('../../../config/styleSchema.js').default;

const parseCookie = (value) => {
  try {
    value = JSON.parse(value);
  } catch (err) {}
  return value;
};

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Info bar',
  },
  fields: {
    add: {
      message: {
        type: 'string',
        required: true,
        label: 'Message',
        help: 'The message that will be shown in the info bar.'
      },
      removable: {
        type: 'boolean',
        required: true,
        help: 'Show a close-button?'
      },
      backgroundColor: {
        type: 'color',
        label: 'Background color'
      },
      // containerStyles: styleSchema.definition('containerStyles', 'Styles')
    },
    group: {
      general: {
        label: 'General',
        fields: ['message', 'removable']
      },
      styling: {
        label: 'Styling',
        fields: ['backgroundColor', 'containerStyles']
      }
    }
  },
  methods(self) {
    return {
      async load(req, widgets) {
        // @todo: req.cookies seems empty
        const hiddenInfoBars = parseCookie(req?.cookies?.['hidden-info-bars']) || [];

        for (const widget of widgets) {
          widget.hidden = hiddenInfoBars ? hiddenInfoBars.includes(widget._id) : false;
          widget.cssHelperClassesString = widget.cssHelperClasses ? widget.cssHelperClasses.join(' ') : '';

          if (widget.containerStyles) {
            widget.styleId = self.apos.util.generateId();
            widget.formattedContainerStyles = styleSchema.format(widget.styleId, widget.containerStyles);
          }
        }
      }
    };
  },
  handlers(self) {
    return {
      'apos:asset:push': {
        async script() {
          self.apos.asset.push('script', 'main', { when: 'always' });
        },
        async style() {
          self.apos.asset.push('stylesheet', 'main', { when: 'always' });
        }
      }
    };
  }
};
