
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('user_roles').del()
    .then(function () {
      // Inserts seed entries, not very smart!!!!
      return knex('user_roles').insert([{
        roleId: 1,
        clientId: 1,
        userId: 1
      },
      {
        roleId: 1,
        clientId: 2,
        userId: 1
      }]);
    });
};
