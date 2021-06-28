
exports.up = function(knex) {
    return knex.schema.createTable('external_csrf_tokens', function(table) {
        table.increments();
        table.string('token').notNullable();
        table.boolean('used').notNullable().defaultTo(false)
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    knex.schema.dropTable('external_csrf_tokens');
};
