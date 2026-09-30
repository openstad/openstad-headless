// Global notification templates: one row per type, inherited by every project that has
// not saved that mail itself. Same columns as notification_templates minus projectId.
//
// No deletedAt on purpose. The db default is paranoid, and a soft deleted row would keep
// occupying the unique index on `type`, so recreating a removed template would fail.
const { Sequelize } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('site_notification_templates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      engine: {
        type: Sequelize.ENUM('email', 'sms', 'carrier pigeon'),
        allowNull: false,
        defaultValue: 'email',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      content: {
        type: Sequelize.JSON,
        allowNull: true,
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

    await queryInterface.addIndex('site_notification_templates', ['type'], {
      unique: true,
      name: 'site_notification_templates_type_unique',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('site_notification_templates');
  },
};
