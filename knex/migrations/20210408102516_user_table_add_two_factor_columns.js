
exports.up = function(knex) {
    return knex.schema.alterTable('users', function(table) {
        table.string('twoFactorToken').notNullable();
        table.boolean('twoFactorConfigured').default(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
        table.dropColumn('twoFactorToken');
        table.dropColumn('twoFactorConfigured');
    });
};
