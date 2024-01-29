const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.removeColumn( 'resources', 'status' );
  },

  async down ({ context: queryInterface }) {
    await queryInterface.addColumn( 'resources', 'status', {
      type: Sequelize.ENUM('OPEN', 'CLOSED', 'ACCEPTED', 'DENIED', 'BUSY', 'DONE'),
      defaultValue: 'OPEN',
      allowNull: false,
    });
  }
};
