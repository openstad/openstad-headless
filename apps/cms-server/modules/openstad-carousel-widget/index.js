/**
 * A widget for display a title with static content
 */

module.exports = {
  extend: 'base-widget',
  options: {
    label: 'Carousel',
  },
  fields: {
    add: {
      title: {
        label: 'Titel van de afbeelding tonen',
        type: 'boolean',
        def: false,
      },
      size: {
        label: 'Hoogte van de afbeeldingen',
        type: 'select',
        def: 'large',
        choices: [
          {
            label: 'Klein',
            value: 'small',
          },
          {
            label: 'Medium',
            value: 'medium',
          },
          {
            label: 'Groot',
            value: 'large',
          },
          {
            label: 'Automatisch (afbeelding bepaalt hoogte)',
            value: 'autoHeight',
          },
        ],
      },
      fit: {
        label: 'Afbeeldingen schalen',
        type: 'select',
        def: 'cover',
        choices: [
          {
            label: 'cover',
            value: 'cover',
          },
          {
            label: 'contain',
            value: 'contain',
          },
        ],
      },

      imageSize: {
        type: 'select',
        label: 'Afbeeldingsgrootte',
        help: 'Kies de grootte van de afbeelding. De grootte van de afbeelding heeft invloed op de laadtijd van de pagina, dus kies de kleinste afmeting die nog steeds scherp is.',
        choices: [
          { label: 'Volledig', value: 'original' },
          { label: 'Extra groot (1600x1600)', value: 'max' },
          { label: 'Groot (1140x1140)', value: 'full' },
          { label: 'Middelgroot (760x760)', value: 'two-thirds' },
          { label: 'Gemiddeld (570x700)', value: 'one-half' },
          { label: 'Klein (380x700)', value: 'one-third' },
          { label: 'Zeer klein (190x350)', value: 'one-sixth' },
        ],
        def: 'full',
      },

      fade: {
        label: 'Overgangsanimatie (fade)',
        type: 'boolean',
        def: false,
        help: 'Schakel dit in om afbeeldingen soepel in elkaar over te laten gaan.',
      },

      autoplay: {
        label: 'Autoplay inschakelen',
        type: 'boolean',
        def: false,
        help: 'Schakel dit in om de carrousel automatisch door de afbeeldingen te bladeren.',
      },

      autoplayInterval: {
        label: 'Autoplay interval (seconden)',
        type: 'integer',
        def: 5,
        min: 1,
        max: 60,
        help: 'Het aantal seconden tussen elke automatische overgang (1-60).',
        if: {
          autoplay: true,
        },
      },

      images: {
        label: 'Afbeeldingen',
        type: 'area',
        options: {
          widgets: {
            '@apostrophecms/image': {},
          },
        },
      },
    },
  },
};
