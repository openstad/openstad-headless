const hat = require('hat');
const removeProtocol = (url) => {
  return url ? url.replace('http://', '').replace('https://', '').replace(/\/$/, "") : '';
}

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('clients').del()
    .then(function () {
      const rack = hat.rack();
      const clientId = process.env.AUTH_FIRST_CLIENT_ID ? process.env.AUTH_FIRST_CLIENT_ID : rack();
      const clientSecret = process.env.AUTH_FIRST_CLIENT_SECRET ? process.env.AUTH_FIRST_CLIENT_SECRET : rack();
      const siteUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL :  process.env.APP_URL;

      console.log('Admin Client ID: ', clientId);
      console.log('Admin Client Secret: ', clientSecret);

      //
      const defaultAllowedDomains = process.env.NODE_ENV === 'development' ? ['localhost'] : [];

      // Inserts seed entries
      return knex('clients').insert([{
        id: 1,
        siteUrl: siteUrl || 'http://localhost:4444',
        redirectUrl: '',// deprecated
        name: "Default client",
        description: 'Client for managing default site and admin panel',
        clientId: clientId,
        clientSecret: clientSecret,
        authTypes: JSON.stringify(['UniqueCode']),
        requiredUserFields: JSON.stringify(['firstName', 'lastName']),
        allowedDomains: JSON.stringify(defaultAllowedDomains.push(removeProtocol(process.env.API_URL))),
        config: JSON.stringify({}),
      },
    ]);
  });

};
//
