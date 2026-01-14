const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('pending_budget_votes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        primaryKey: true,
        allowNull: false,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('pending_budget_votes');
  },
};
