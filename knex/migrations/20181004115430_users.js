
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    table.string('firstName');
    table.string('lastName');
    table.string('email');
    table.string('phoneNumber');
    table.string('streetName');
    table.string('houseNumber');
    table.string('city');
    table.string('suffix');
    table.string('postcode');
    table.string('password');
    table.string('resetPasswordToken');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('users');
};
