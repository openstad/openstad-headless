const { Sequelize } = require('sequelize');

module.exports = {
    async up({ context: queryInterface }) {
        await queryInterface.addColumn('users', 'emailNotificationConsentSetForClientId', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'postcode',
        });
    },

    async down({ context: queryInterface }) {
        await queryInterface.removeColumn('users', 'emailNotificationConsentSetForClientId');
    }
};