const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'resources', 'widgetId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'projectId',
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('resources', 'widgetId');
  }
};
