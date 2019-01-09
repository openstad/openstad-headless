
exports.up = function(knex, Promise) {
  return knex.schema.table('password_reset_tokens', function(table) {
    table.boolean('valid').notNullable().defaultTo(true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('password_reset_tokens', function(table) {
    table.dropColumn('valid');
  });
};
