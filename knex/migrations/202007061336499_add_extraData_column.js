exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.json('extraData').after('phoneNumber');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('extraData');
  });
};
