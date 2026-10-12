const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.changeColumn('notifications', 'to', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.changeColumn('notifications', 'to', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
