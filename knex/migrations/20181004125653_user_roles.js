
exports.up = function(knex, Promise) {
  return knex.schema.createTable('roles', function(table) {
    table.increments();
    table.string('first_name');
    table.string('last_name');
    table.string('email');
    table.string('street_name').notNullable();
    table.string('house_number').notNullable();
    table.string('city');
    table.string('suffix');
    table.string('postcode');
    table.string('phone_number');
    table.string('resetPasswordToken');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {

};
