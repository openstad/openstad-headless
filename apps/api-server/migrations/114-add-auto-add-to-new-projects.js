module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('users', 'autoAddToNewProjects', {
      type: require('sequelize').BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('users', 'autoAddToNewProjects');
  },
};
