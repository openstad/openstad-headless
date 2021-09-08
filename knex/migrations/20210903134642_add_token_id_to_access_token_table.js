
exports.up = function(knex) {
  return knex.schema.table('access_tokens', function(table) {
    table.string('tokenId').notNullable().after('id');
  });
};

exports.down = function(knex) {

};
