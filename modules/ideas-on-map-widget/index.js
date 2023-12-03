const { fields, arrangeFields } = require('./lib/fields');
const createConfig = require('./lib/create-config');
const { contructComponentsCdn } = require('../../services/cdns');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Kaart applicatie',
    deferred: true
  },
  fields: {
    add: {
      ...fields
    },
    group: {
      ...arrangeFields
    }
  },
  methods(self) {
    return {
      async output(req, widget, options, _with) {
        // Access data from req object
        let openstadComponentsCdn;

        try {
          openstadComponentsCdn = await contructComponentsCdn();
        } catch (e) {
          console.log('openstadComponentsCdn: ', e)
        }

        const aposSiteOptions = self.apos.options.options;

        let config = {};

        try {
          config = createConfig({
            widget,
            data: req.data,
            config: aposSiteOptions?.config,
            apos: self.apos
          });

          config.siteId = aposSiteOptions.id

          config.api = {
            url: process.env.API_URL
          }
        } catch (e) {
          console.log('Error in createConfig: ', e)
        }

        // Include the data in the widget object
        widget.config = config;
        widget.divId = widget.config.divId;
        widget.openstadComponentsCdn = openstadComponentsCdn;

        // Render the widget using the widget.html template
        const rendered = await self.render(req, 'widget', { widget, options, _with });
        return self.apos.template.safe(rendered);
      }
    };
  }
};
