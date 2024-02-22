const { Sequelize } = require('sequelize');

module.exports = {

  async up ({ context: queryInterface }) {
    await queryInterface.dropTable('notification_rulesets');
  },

  async down ({ context: queryInterface }) {
    queryInterface.createTable('notification_rulesets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      notificationTemplateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      active: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      body: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '{}',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        default: null,
      },
    });
  }

};
