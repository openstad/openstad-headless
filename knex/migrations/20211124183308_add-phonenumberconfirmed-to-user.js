
exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.boolean('phoneNumberConfirmed').default(false);
  });
};

exports.down = function(knex) {
  
};
