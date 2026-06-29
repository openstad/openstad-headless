const { Sequelize } = require('sequelize');

// Make api_tokens.expiresAt nullable so a token can be created without an
// expiry date (null = never expires). 113 created the column as NOT NULL.
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.changeColumn('api_tokens', 'expiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.changeColumn('api_tokens', 'expiresAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },
};
