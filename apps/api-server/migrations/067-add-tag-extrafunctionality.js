const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'tags', 'extraFunctionality', {
      type: Sequelize.JSON,
      allowNull: null,
      after: 'listIcon',
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('tags', 'extraFunctionality');
  }
};
