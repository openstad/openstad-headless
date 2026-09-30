const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('notification_templates', 'content', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'body',
      defaultValue: null,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('notification_templates', 'content');
  },
};
