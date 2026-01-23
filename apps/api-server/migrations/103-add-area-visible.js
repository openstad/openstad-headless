const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('areas', 'hidePolygon', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('areas', 'hidePolygon');
  },
};
