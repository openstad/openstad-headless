const { Sequelize } = require('sequelize');

module.exports = {

  async up ({ context: queryInterface }) {
    queryInterface.createTable('notification_templates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      projectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      engine: {
        type: Sequelize.ENUM('email', 'sms', 'carrier pigeon'),
        allowNull: false,
        default: 'email',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
        default: '',
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
        default: '',
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
  },

  async down ({ context: queryInterface }) {
    await queryInterface.dropTable('notification_templates');
  }

};
