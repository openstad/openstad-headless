// Attributes that are rendered from their own field or are unsafe to set freely
const blockedAttributes = ['src', 'srcdoc', 'sandbox', 'title', 'height', 'width'];

module.exports = {
  extend: 'base-widget',
  options: {
    label: 'iFrame',
  },
  fields: {
    add: {
      url: {
        type: 'url',
        label: 'URL',
        help: 'De URL van de pagina die in het iframe wordt geladen (alleen http/https)',
        required: true,
      },
      title: {
        type: 'string',
        label: 'Titel',
        help: 'Beschrijvende titel van de iframe-inhoud, verplicht voor toegankelijkheid (WCAG)',
        required: true,
      },
      height: {
        type: 'integer',
        label: 'Hoogte (px)',
        help: 'Fallback-hoogte. Wordt overschreven als de ingeladen pagina zijn hoogte doorgeeft via window.parent.postMessage({ iframeHeight: hoogte }, "*")',
        def: 750,
        min: 1,
      },
      allowfullscreen: {
        type: 'boolean',
        label: 'Volledig scherm toestaan',
        def: false,
      },
      sandbox: {
        type: 'checkboxes',
        label: 'Sandbox-permissies',
        help: 'Niets aangevinkt = geen sandbox-attribuut (geen restricties)',
        choices: [
          { label: 'allow-scripts', value: 'allow-scripts' },
          { label: 'allow-same-origin', value: 'allow-same-origin' },
          { label: 'allow-forms', value: 'allow-forms' },
          { label: 'allow-popups', value: 'allow-popups' },
          { label: 'allow-top-navigation', value: 'allow-top-navigation' },
        ],
      },
      passUtmParams: {
        type: 'boolean',
        label: 'UTM-parameters doorgeven',
        help: 'Voegt alle utm_* parameters uit de pagina-URL toe aan de iframe-URL',
        def: false,
      },
      extraAttributes: {
        type: 'array',
        label: 'Extra attributen',
        titleField: 'name',
        fields: {
          add: {
            name: {
              type: 'string',
              label: 'Naam',
              required: true,
            },
            value: {
              type: 'string',
              label: 'Waarde',
            },
          },
        },
      },
    },
  },
  methods(self) {
    return {
      async load(req, widgets) {
        widgets.forEach((widget) => {
          let url;
          try {
            url = new URL(widget.url);
          } catch (err) {
            return;
          }
          if (!['http:', 'https:'].includes(url.protocol)) {
            return;
          }
          if (widget.passUtmParams) {
            Object.entries(req.query || {}).forEach(([key, value]) => {
              if (key.toLowerCase().startsWith('utm_') && typeof value === 'string') {
                url.searchParams.set(key, value);
              }
            });
          }
          widget._src = url.href;
          widget._extraAttributes = (widget.extraAttributes || []).filter(
            (attr) =>
              /^[a-z][a-z0-9-]*$/i.test(attr.name) &&
              !attr.name.toLowerCase().startsWith('on') &&
              !blockedAttributes.includes(attr.name.toLowerCase())
          );
        });
      },
    };
  },
};
