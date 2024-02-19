const { Sequelize } = require('sequelize');

module.exports = {

  async up ({ context: queryInterface }) {
    await queryInterface.dropTable('notifications');
  },

  async down ({ context: queryInterface }) {
    queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
        defaultValue: 'NEW',
      },
      to: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      from: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      },
      body: {
        type: Sequelize.BLOB,
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
