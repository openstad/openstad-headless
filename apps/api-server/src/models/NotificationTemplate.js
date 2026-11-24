const merge = require('merge');
const {
  assertValidContent,
  isContentType,
} = require('../notifications/content-catalog');

module.exports = (db, sequelize, DataTypes) => {
  const NotificationTemplate = sequelize.define(
    'notification_template',
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      engine: {
        type: DataTypes.ENUM('email', 'sms', 'carrier pigeon'),
        allowNull: false,
        default: 'email',
      },

      type: {
        type: DataTypes.STRING,
        allowNull: true,
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

      content: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        validate: {
          isNotificationContent(value) {
            if (value === null || value === undefined) return;
            assertValidContent(value);
          },
        },
      },
    },
    {
      validate: {
        contentOnlyForContentTypes() {
          if (this.content && !isContentType(this.type)) {
            throw new Error(
              `Notification type '${this.type}' cannot be edited with fields`
            );
          }
        },
      },

      hooks: {
        afterCreate: async function (instance) {
          await updateAuthClient(instance, {
            subject: instance.subject,
            body: instance.body,
          });
        },

        afterUpdate: async function (instance) {
          await updateAuthClient(instance, {
            subject: instance.subject,
            body: instance.body,
          });
        },

        afterDestroy: async function (instance) {
          await updateAuthClient(instance, { subject: '', body: '' });
        },
      },
    }
  );

  NotificationTemplate.auth = NotificationTemplate.prototype.auth = {
    listableBy: 'editor',
    viewableBy: 'editor',
    createableBy: 'editor',
    updateableBy: 'editor',
    deleteableBy: 'editor',
  };

  NotificationTemplate.associate = function (models) {
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  };

  return NotificationTemplate;

  // temp solution: the auth serrver should use this notification service (https://github.com/openstad/openstad-headless/issues/256) but until then auth templates are updated here
  async function updateAuthClient(instance, { subject, body }) {
    if (instance.type != 'login email') return;

    let project;
    if (instance.projectId) {
      project = await db.Project.findByPk(instance.projectId);
    }

    if (project) {
      const authSettings = require('../util/auth-settings');
      let providers = await authSettings.providers({ project });
      for (let provider of providers) {
        let authConfig = await authSettings.configForClientUpdate({
          project,
          useAuth: provider,
        });
        let newConfig = {
          config: {
            Url: {
              emailSubject: subject.replace(
                /\{\{\project.name}\}/,
                project.name
              ),
              emailTemplate: body.replace(/\{\{\project.name}\}/, project.name),
            },
          },
        };
        let adapter = await authSettings.adapter({ authConfig });
        if (adapter.service.updateClient) {
          let merged = merge.recursive({}, authConfig, newConfig);
          await adapter.service.updateClient({ authConfig: merged, project });
        }
      }
    }
  }
};
