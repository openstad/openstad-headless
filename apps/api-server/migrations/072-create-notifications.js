const { Sequelize } = require('sequelize');

module.exports = {

  async up ({ context: queryInterface }) {
    queryInterface.createTable('notifications', {
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
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'new',
      },
      from: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      to: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
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
    await queryInterface.dropTable('notifications');
  }

};
