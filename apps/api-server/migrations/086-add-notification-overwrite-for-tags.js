const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('tags', 'useDifferentSubmitAddress', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      default: false,
      after: 'extraFunctionality',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('tags', 'useDifferentSubmitAddress');
  }
};
