// Single-row table holding the global project settings, reusing Project's config and
// emailConfig JSON shape. Not a Project with id=0: without NO_AUTO_VALUE_ON_ZERO in
// sql_mode MySQL replaces an explicit id=0 insert with the next AUTO_INCREMENT value.
const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('site_configs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      config: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      emailConfig: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // createTable is CREATE TABLE IF NOT EXISTS, so the table can already exist here;
    // ignoreDuplicates keeps the seed from failing on the primary key.
    await queryInterface.bulkInsert(
      'site_configs',
      [
        {
          id: 1,
          config: '{}',
          emailConfig: '{}',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('site_configs');
  },
};
