
exports.up = function(knex) {
    return knex.schema.alterTable('clients', function(table) {
        table.json('twoFactorRoles').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('clients', function(table) {
        table.dropColumn('twoFactorRoles');
    });
};
