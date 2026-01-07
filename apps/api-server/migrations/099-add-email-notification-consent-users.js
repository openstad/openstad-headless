const { Sequelize } = require('sequelize');

module.exports = {
    async up({ context: queryInterface }) {
        await queryInterface.addColumn('users', 'emailNotificationConsent', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            after: 'postcode',
            defaultValue: false,
        });
    },

    async down({ context: queryInterface }) {
        await queryInterface.removeColumn('users', 'emailNotificationConsent');
    }
};
