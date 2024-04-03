// const styleSchema = require('../../../config/styleSchema.js').default;

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Openstad Component'
  },
  fields: {
    add: {
      componentUrl: {
        type: 'string',
        label: 'Url uit de script tag',
        help: 'Deze URL is te vinden in het tabblad "Publiceren" bij de widget in het beheergedeelte van OpenStad.',
        required: true
      },
    },
    group: {
      general: {
        label: 'General',
        fields: ['uploadedImage']
      },
      styling: {
        label: 'Styling',
        fields: ['imageStyles']
      }
    }
  },
  methods(self) {
    return {
      // Extract the URL from the script tag in the sanitization process
      // This allows a user to paste the entire script tag into the input field
      // but also allows just the URL to be pasted.
      sanitize (req, input, options) {
        if (!input.componentUrl) {
          return input;
        }
        
        // Extract the URL from the script tag
        const regex = /<script src="([a-zA-Z0-9\/:]*)".*><\/script>/;
        const match = input.componentUrl.match(regex);
        
        if (match) {
          input.componentUrl = match[1];
        }
        
        return input;
      }
    };
  }
};
