
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('login_tokens', function(table) {
    table.dropForeign('userId')
    table.foreign('userId').references('users.id').onDelete('cascade');
  });
};

exports.down = function(knex, Promise) {

};
