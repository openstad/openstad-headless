module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addColumn('widget_versions', 'name', {
      type: require('sequelize').STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('widget_versions', 'pinned', {
      type: require('sequelize').BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeColumn('widget_versions', 'pinned');
    await queryInterface.removeColumn('widget_versions', 'name');
  },
};
