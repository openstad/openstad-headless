const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('duplicationJobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '{}',
      },
      result: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      claimedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        default: null,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        default: null,
      },
    });

    await queryInterface.addIndex('duplicationJobs', ['status']);
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('duplicationJobs');
  },
};
