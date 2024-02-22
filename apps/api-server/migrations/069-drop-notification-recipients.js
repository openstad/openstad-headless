const { Sequelize } = require('sequelize');

module.exports = {

  async up ({ context: queryInterface }) {
    await queryInterface.dropTable('notification_recipients');
  },

  async down ({ context: queryInterface }) {
    queryInterface.createTable('notification_recipients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      notificationRulesetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      emailType: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
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
