const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'resources', 'documents', {
      type: Sequelize.JSON,
      allowNull: true,
      after: 'images',
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('resources', 'documents');
  }
};
