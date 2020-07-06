
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.string('hashedPhoneNumber').after('phoneNumber');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('hashedPhoneNumber');
  });
};
