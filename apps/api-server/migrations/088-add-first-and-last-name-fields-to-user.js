const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn('users', 'firstName', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'name'
    });

    await queryInterface.addColumn('users', 'lastName', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'firstName'
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('users', 'firstName');
    await queryInterface.removeColumn('users', 'lastName');
  }
};
