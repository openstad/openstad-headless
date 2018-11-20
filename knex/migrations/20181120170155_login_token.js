
exports.up = function(knex, Promise) {
  return knex.schema.createTable('login_tokens', function(table) {
    table.increments();
    table.string('token').notNullable();
    table.integer('userId').unsigned().notNullable().references('id').inTable('users');
    table.timestamp('createdAt').defaultTo(knex.fn.now())
  });
};

exports.down = function(knex, Promise) {

};
