
exports.up = function(knex, Promise) {
  return knex.schema.createTable('password_reset_tokens', function(table) {
    table.increments();
    table.string('token').notNullable();
    table.integer('userId').unsigned().notNullable().references('id').inTable('users');
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('password_reset_tokens');
};
