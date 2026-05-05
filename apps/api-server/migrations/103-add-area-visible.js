const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    const tableDescription = await queryInterface.describeTable('areas');
    if (!tableDescription.hidePolygon) {
      await queryInterface.addColumn('areas', 'hidePolygon', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('areas', 'hidePolygon');
  },
};
