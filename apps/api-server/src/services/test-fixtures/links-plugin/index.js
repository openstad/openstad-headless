module.exports = {
  manifest: {
    name: 'links-fixture',
    version: '0.0.0',
    api: {
      linkRequestHandler: { handler: './link-requests.js' },
      contactHandlers: [
        {
          key: 'link-request',
          label: 'Koppelverzoek',
          handler: './contact.js',
        },
      ],
      sources: [
        {
          key: 'fixture-source',
          label: 'Fixture bron',
          handler: './source.js',
        },
      ],
      notifications: [
        {
          type: 'link invitation - user',
          label: 'Uitnodiging ontvangen',
          template: './templates/link invitation - user',
          immediate: true,
        },
      ],
    },
  },
};
