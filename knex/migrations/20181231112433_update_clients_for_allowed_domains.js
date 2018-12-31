exports.up = function(knex, Promise) {
  return knex.schema.table('clients', function(table) {
    table.json('allowedDomains');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('clients', function(table) {
    table.dropColumn('allowedDomains')
  });
};
