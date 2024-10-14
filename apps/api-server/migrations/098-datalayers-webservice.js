const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('datalayers', 'useRealtimeWebservice', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      default: false,
      after: 'layer',
    });

    await queryInterface.addColumn('datalayers', 'webserviceUrl', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'useRealtimeWebservice',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('datalayers', 'useRealtimeWebservice');
    await queryInterface.removeColumn('datalayers', 'webserviceUrl');
  }
};
