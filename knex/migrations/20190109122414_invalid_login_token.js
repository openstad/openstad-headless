
exports.up = function(knex, Promise) {
  return knex.schema.table('login_tokens', function(table) {
    table.boolean('valid').notNullable().defaultTo(true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('login_tokens', function(table) {
    table.dropColumn('config');
  });
};
