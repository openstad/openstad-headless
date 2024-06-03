const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'tags', 'addToNewResources', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      default: false,
      after: 'seqnr',
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('tags', 'addToNewResources');
  }
};
