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
      const adminClientId = process.env.AUTH_ADMIN_CLIENT_ID ? process.env.AUTH_ADMIN_CLIENT_ID : rack();
      const adminClientSecret = process.env.AUTH_ADMIN_CLIENT_SECRET ? process.env.AUTH_ADMIN_CLIENT_SECRET : rack();

      const siteUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL :  process.env.APP_URL;
      const adminUrl = process.env.ADMIN_URL ? process.env.ADMIN_URL :  process.env.APP_URL;

      const defaultAllowedDomains = process.env.NODE_ENV === 'development' ? ['localhost'] : [];

      const allowedDomains = process.env.NODE_ENV === 'development' ? ['localhost'] : [];
      allowedDomains.push(removeProtocol(process.env.API_URL));

      // Inserts seed entries
      return knex('clients').insert([{
        id: 1,
        siteUrl: siteUrl,
        redirectUrl: '',// deprecated
        name: "Default site",
        description: 'Client for managing default site',
        clientId: clientId,
        clientSecret: clientSecret,
        authTypes: JSON.stringify(['UniqueCode']),
        requiredUserFields: JSON.stringify(['firstName', 'lastName']),
        allowedDomains: JSON.stringify(allowedDomains),
        config: JSON.stringify({}),
      },
      {
        id: 2,
        siteUrl: adminUrl,
        redirectUrl: '',// deprecated
        name: "Admin panel",
        description: 'Client for managing the admin panel',
        clientId: adminClientId,
        clientSecret: adminClientSecret,
        authTypes: JSON.stringify(['UniqueCode']),
        requiredUserFields: JSON.stringify(['firstName', 'lastName']),
        allowedDomains: JSON.stringify(allowedDomains),
        config: JSON.stringify({}),
      },
    ]);
  });

};
//
