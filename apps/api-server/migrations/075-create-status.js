const { Sequelize } = require('sequelize');

module.exports = {

  async up ({ context: queryInterface }) {
    queryInterface.createTable('statuses', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      seqnr: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 10,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      backgroundColor: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mapIcon: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      listIcon: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      extraFunctionality: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      },
      extraData: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
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
