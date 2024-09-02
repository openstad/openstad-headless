// `apps/api-server/migrations/093-add-projectId-column.js`
const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('choices_guide_results', 'projectId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'id',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('choices_guide_results', 'projectId');
  }
};