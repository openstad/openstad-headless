const merge = require('merge');

// Keys the admin's content editor writes. Anything else is rejected so the
// column cannot collect stray data: the routes pass the whole request body
// straight into create/update.
const CONTENT_KEYS = [
  'heading',
  'greeting',
  'intro',
  'buttonLabel',
  'buttonUrl',
  'footer',
];

// Same column, but a flag instead of a text field: show the logo in this mail.
const CONTENT_BOOLEAN_KEYS = ['showLogo'];

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

      // Structured content for the admin's field editor. NULL means the
      // template is managed as raw MJML; `body` stays the source for sending
      // either way.
      content: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        validate: {
          isContentObject(value) {
            if (value === null || value === undefined) return;
            if (typeof value !== 'object' || Array.isArray(value)) {
              throw new Error('content must be an object');
            }
            for (const key of Object.keys(value)) {
              if (CONTENT_BOOLEAN_KEYS.includes(key)) {
                if (value[key] !== null && typeof value[key] !== 'boolean') {
                  throw new Error(`content.${key} must be a boolean`);
                }
                continue;
              }
              if (!CONTENT_KEYS.includes(key)) {
                throw new Error(`content contains unknown key: ${key}`);
              }
              if (value[key] !== null && typeof value[key] !== 'string') {
                throw new Error(`content.${key} must be a string`);
              }
            }
          },
        },
      },
    },
    {
      hooks: {
        afterCreate: async function (instance, options) {
          await updateAuthClient(instance, options);
        },

        afterUpdate: async function (instance, options) {
          await updateAuthClient(instance, options);
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
  async function updateAuthClient(instance, options) {
    if (instance.type != 'login email') return;

    let project;
    if (instance.projectId) {
      project = await db.Project.findByPk(instance.projectId);
    }

    if (project) {
      const authSettings = require('../util/auth-settings');
      let providers = await authSettings.providers({ project });
      for (let provider of providers) {
        let authConfig = await authSettings.config({
          project,
          useAuth: provider,
        });
        let newConfig = {
          config: {
            Url: {
              emailSubject: instance.subject.replace(
                /\{\{\project.name}\}/,
                project.name
              ),
              emailTemplate: instance.body.replace(
                /\{\{\project.name}\}/,
                project.name
              ),
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
