const hat = require('hat');

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('clients').del()
    .then(function () {
      const rack = hat.rack();
      const clientId = process.env.AUTH_FIRST_CLIENT_ID ? process.env.AUTH_FIRST_CLIENT_ID : rack();
      const clientSecret = process.env.AUTH_FIRST_CLIENT_SECRET ? process.env.AUTH_FIRST_CLIENT_SECRET : rack();
      const siteUrl = process.env.AUTH_FIRST_CLIENT_URL ? process.env.AUTH_FIRST_CLIENT_URL :  process.env.APP_URL;


      AUTH_FIRST_CLIENT_LOGIN_CODE
      console.log('Admin Client ID: ', clientId);
      console.log('Admin Client Secret: ', clientSecret);
      console.log('Login url is found here: ', 'YOUR_APP_URL/admin/clients');

      // Inserts seed entries
      return knex('clients').insert([{
        id: 1,
        siteUrl: siteUrl || 'http://localhost:4444',
        redirectUrl: process.env.ADMIN_REDIRECT_URL  || 'http://localhost:4444', //deprecated
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
