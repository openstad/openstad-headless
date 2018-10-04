
exports.up = function(knex, Promise) {
  return knex.schema.createTable('sites', function(table) {
    table.increments();
    table.string('name').notNullable();
    table.string('clientId').notNullable();
    table.string('clientSecret').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('sites');
};
