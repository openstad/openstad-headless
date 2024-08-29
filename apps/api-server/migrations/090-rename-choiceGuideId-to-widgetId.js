const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.renameColumn('choice_guide_results', 'choiceGuideId', 'widgetId');
  },

  async down({ context: queryInterface }) {
    await queryInterface.renameColumn('choice_guide_results', 'widgetId', 'choiceGuideId');
  }
};