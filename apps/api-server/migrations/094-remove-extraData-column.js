const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.removeColumn('choices_guide_results', 'extraData');
  },

  async down({ context: queryInterface }) {
    await queryInterface.addColumn('choices_guide_results', 'extraData', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  }
};