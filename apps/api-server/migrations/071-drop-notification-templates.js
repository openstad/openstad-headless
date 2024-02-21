const { Sequelize } = require('sequelize');

module.exports = {

  async up ({ context: queryInterface }) {
    await queryInterface.dropTable('notification_templates');
  },

  async down ({ context: queryInterface }) {
    queryInterface.createTable('notifications_templates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: true,
        unique: false,
      },
      templateFile: {
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
