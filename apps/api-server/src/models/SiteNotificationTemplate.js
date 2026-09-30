const { assertContentObject } = require('./lib/notification-content-validator');

// The global notification templates: one row per type, no project. A project that has
// never saved a mail itself inherits this row, see notifications/resolve-template.js.
//
// Deliberately not a NotificationTemplate with a sentinel projectId: that column is
// NOT NULL with a foreign key to projects, and its auth is editor level everywhere,
// while the global templates must only be writable by an admin.
module.exports = (db, sequelize, DataTypes) => {
  const SiteNotificationTemplate = sequelize.define(
    'site_notification_template',
    {
      engine: {
        type: DataTypes.ENUM('email', 'sms', 'carrier pigeon'),
        allowNull: false,
        defaultValue: 'email',
      },

      type: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      subject: {
        type: DataTypes.STRING,
        allowNull: true,
        default: '',
      },

      body: {
        type: DataTypes.TEXT,
        allowNull: true,
        default: '',
      },

      // Same meaning as on NotificationTemplate: NULL means the template is managed
      // as raw MJML, and `body` is the source for sending either way.
      content: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        validate: {
          isContentObject(value) {
            assertContentObject(value);
          },
        },
      },
    },
    {
      // The db default is paranoid. A soft deleted row would keep holding the unique
      // index on `type`, so removing a global template and adding it again would fail.
      paranoid: false,
    }
  );

  // An editor reads them to see what a project inherits; only an admin may change them.
  SiteNotificationTemplate.auth = SiteNotificationTemplate.prototype.auth = {
    listableBy: 'editor',
    viewableBy: 'editor',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  // No updateAuthClient hook here on purpose. That hook pushes a project's `login email`
  // to that project's auth client; a global template has no project to push to. The
  // global login mail reaches a project through the copy on project creation instead,
  // see util/global-project-defaults.js.

  return SiteNotificationTemplate;
};
