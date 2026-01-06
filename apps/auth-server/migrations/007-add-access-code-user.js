const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('users', 'accessCode', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'postcode',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('users', 'accessCode');
  }
};