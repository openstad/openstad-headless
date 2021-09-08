
exports.up = function(knex) {
  return knex.schema.createTable('access_tokens', function(table) {
    table.increments();
    table.integer('userID').unsigned().notNullable();//.references('id').inTable('users');
    table.integer('clientID').unsigned().notNullable();//.references('id').inTable('clients');
    table.string('scope').notNullable();
    table.timestamp('expirationDate').defaultTo(knex.fn.now());
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  knex.schema.dropTable('access_tokens');

};
