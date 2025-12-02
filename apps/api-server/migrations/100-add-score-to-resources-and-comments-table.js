const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'resources', 'score', {
      type: Sequelize.DECIMAL(12,11),
      allowNull: false,
      default: 0,
      after: 'sort',
    });
    
    await queryInterface.addColumn( 'comments', 'score', {
      type: Sequelize.DECIMAL(12,11),
      allowNull: false,
      default: 0,
      after: 'sentiment',
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('resources', 'score');
    await queryInterface.removeColumn('comments', 'score');
  }
};
