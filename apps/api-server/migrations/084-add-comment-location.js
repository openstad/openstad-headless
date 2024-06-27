const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'comments', 'location', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('comments', 'location');
  }
};
