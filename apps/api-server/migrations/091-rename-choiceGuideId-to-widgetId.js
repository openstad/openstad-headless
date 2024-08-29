const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.renameColumn('choices_guide_results', 'choicesGuideId', 'widgetId');
  },

  async down({ context: queryInterface }) {
    await queryInterface.renameColumn('choices_guide_results', 'widgetId', 'choicesGuideId');
  }
};