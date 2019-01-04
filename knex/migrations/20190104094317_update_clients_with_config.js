exports.up = function(knex, Promise) {
  return knex.schema.table('clients', function(table) {
    table.json('config');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('clients', function(table) {
    table.dropColumn('config')
  });
};
