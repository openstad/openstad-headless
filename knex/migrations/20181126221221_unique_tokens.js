exports.up = function(knex, Promise) {
  return knex.schema.createTable('unique_tokens', function(table) {
    table.increments();
    table.string('code').notNullable();
    table.integer('userId').unsigned().notNullable().references('id').inTable('users');
    table.integer('clientId').unsigned().notNullable().references('id').inTable('clients');
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  });
};

exports.down = function(knex, Promise) {

};
