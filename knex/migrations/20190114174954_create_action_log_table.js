
exports.up = function(knex, Promise) {
  return knex.schema.createTable('action_log', function(table) {
    table.increments();
    table.string('method').defaultTo(null);
    table.string('action').defaultTo(null);
    table.string('name').defaultTo(null);
    table.string('value').defaultTo(null);


    table.string('ip').defaultTo(null);

    table.integer('userId').defaultTo(null).unsigned().references('id').inTable('users');
    table.integer('clientId').defaultTo(null).unsigned().references('id').inTable('clients');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('action_log');
};
