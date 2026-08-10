const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('authorization_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tokenId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      clientID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      redirectURI: {
        type: Sequelize.STRING(2048),
        allowNull: true,
      },
      userID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      scope: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('refresh_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tokenId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      userID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      clientID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      scope: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      taskId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      lastUpdateDate: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('authorization_codes');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('tasks');
  },
};
