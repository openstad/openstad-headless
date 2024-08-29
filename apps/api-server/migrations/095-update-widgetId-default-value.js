const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.changeColumn('choices_guide_results', 'widgetId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.changeColumn('choices_guide_results', 'widgetId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  }
};