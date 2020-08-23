const hat = require('hat');

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('unique_codes').del()
    .then(function () {
      const rack = hat.rack();
      const uniqueCode = process.env.AUTH_FIRST_CLIENT_LOGIN_CODE ? process.env.AUTH_FIRST_CLIENT_LOGIN_CODE : rack();

      console.log('Admin login code: ', uniqueCode);

      // Inserts seed entries
      return knex('unique_codes').insert([{
        code: uniqueCode,
        userId: 1,
        clientId: 1
      },{
        code: uniqueCode,
        userId: 1,
        clientId: 2
      }]);
    });
};
