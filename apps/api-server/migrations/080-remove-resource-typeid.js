const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.removeColumn( 'resources', 'typeId' );
  },

  async down ({ context: queryInterface }) {
    await queryInterface.addColumn( 'resources', 'typeId', {
      type: Sequelize.INTEGER,
      defaultValue: null,
      allowNull: null,
    });
  }
};
