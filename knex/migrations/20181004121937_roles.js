
exports.up = function(knex, Promise) {
  return knex.schema.createTable('roles', function(table) {
    table.increments();
    table.string('name').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  });
};

exports.down = function(knex, Promise) {

};
