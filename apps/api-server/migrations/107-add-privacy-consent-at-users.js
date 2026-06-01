const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('users', 'privacyConsentAt', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'emailNotificationConsent',
      defaultValue: null,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('users', 'privacyConsentAt');
  },
};
