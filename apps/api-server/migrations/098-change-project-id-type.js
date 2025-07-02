const { Sequelize } = require('sequelize');

module.exports = {
    async up({ context: queryInterface }) {
        await queryInterface.removeConstraint('tags', 'tags_ibfk_1');
    },

    async down({ context: queryInterface }) {
        await queryInterface.addConstraint('tags', {
            fields: ['projectId'],
            type: 'foreign key',
            name: 'tags_ibfk_1',
            references: {
                table: 'projects',
                field: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    }
};