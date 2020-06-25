const hat = require('hat');

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('clients').del()
    .then(function () {
      const stripProtocol = (url) => {
        return url ? url.replace(/^https?:\/\//,'') : '';
      }
      const rack = hat.rack();
      const clientId = process.env.AUTH_FIRST_CLIENT_ID ? process.env.AUTH_FIRST_CLIENT_ID : rack();
      const clientSecret = process.env.AUTH_FIRST_CLIENT_SECRET ? process.env.AUTH_FIRST_CLIENT_SECRET : rack();
      const adminUrl = process.env.ADMIN_URL;
      const frontendUrl = process.env.FRONTEND_URL;
      const adminDomain = stripProtocol(adminUrl);
      const frontendDomain = stripProtocol(frontendUrl);


      console.log('Admin Client ID: ', clientId);
      console.log('Admin Client Secret: ', clientSecret);

      // Inserts seed entries
      return knex('clients').insert([{
        id: 1,
        siteUrl: adminUrl || 'http://localhost:7777',
        redirectUrl: adminUrl  || 'http://localhost:7777', //deprecated
        name: "Admin panel",
        description: 'Admin panel for managing clients, roles & users',
        clientId: clientId,
        clientSecret: clientSecret,
        authTypes: JSON.stringify(['UniqueCode']),
        requiredUserFields: JSON.stringify(['firstName', 'lastName', 'postcode']),
        allowedDomains: JSON.stringify(['localhost', adminDomain]),
        config: JSON.stringify({}),
      },
      {
        id: 2,
        siteUrl: frontendUrl || 'http://localhost:4444',
        redirectUrl: frontendUrl || 'http://localhost:4444', //deprecated
        name: "Admin panel",
        description: 'Admin panel for managing clients, roles & users',
        clientId: clientId,
        clientSecret: clientSecret,
        authTypes: JSON.stringify(['UniqueCode']),
        requiredUserFields: JSON.stringify(['firstName', 'lastName', 'postcode']),
        allowedDomains: JSON.stringify(['localhost', frontendDomain]),
        config: JSON.stringify({}),
      }
    ]);
  });

};
//
