const hat = require('hat');

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('clients').del()
    .then(function () {
      const rack = hat.rack();
      const clientId = rack();
      const clientSecret = rack();

      console.log('Admin Client ID: ', clientId);
      console.log('Admin Client Secret: ', clientSecret);
      console.log('Login url is found here: ', 'YOUR_APP_URL/admin/clients');

      // Inserts seed entries
      return knex('clients').insert([{
        id: 1,
        siteUrl: process.env.APP_URL || 'http:/localhost:4000',
        redirectUrl: process.env.ADMIN_REDIRECT_URL  || 'http:/localhost:4000/admin/clients',
        name: "Admin panel",
        description: 'Admin panel for managing clients, roles & users',
        clientId: clientId,
        clientSecret: clientSecret,
        authTypes: JSON.stringify(['UniqueCode']),
        requiredUserFields: JSON.stringify(['email', 'firstName', 'lastName']),
      },
    ]);
  });

};
//
