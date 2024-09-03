const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('tags', 'documentMapIconColor', {
      type: Sequelize.TEXT,
      allowNull: true,
      default: false,
      after: 'defaultResourceImage',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('tags', 'documentMapIconColor');
  }
};
