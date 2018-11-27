
exports.up = function(knex, Promise) {
  return knex.schema.createTable('clients', function(table) {
    table.increments();
    table.string('name').notNullable();
    table.string('siteUrl').notNullable();
    table.string('redirectUrl').notNullable();
    table.string('description').notNullable();
    table.string('clientId').notNullable();
    table.string('clientSecret').notNullable();
    table.json('loginOptions').notNullable();
    table.json('requiredFields');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
    table.unique('clientId');
    table.unique('clientSecret');
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('clients');
};
