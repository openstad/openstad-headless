const fs = require('fs').promises;
const path = require('path');
const nunjucks = require('nunjucks');
const mjml2html = require('mjml');
const sendMessage = require('../notifications/send-engines');

const nunjucksEnvReady = (async () => {
  const { applyFilters } =
    await import('../../../../packages/raw-resource/includes/nunjucks-filters-js.cjs');

  const nunjucksEnv = new nunjucks.Environment();
  applyFilters(nunjucksEnv);
  return nunjucksEnv;
})();

async function loadDefaultTemplate(type) {
  const templatePath = path.join(
    __dirname,
    '../notifications/default-templates',
    path.basename(type || '')
  );
  let file;
  try {
    file = await fs.readFile(templatePath);
  } catch (err) {
    return null;
  }
  file = file.toString();
  let match = file.match(
    /<subject>((?:.|\r|\n)*)<\/subject>(?:.|\r|\n)*<body>((?:.|\r|\n)*)<\/body>/
  );
  let subject = match && match[1];
  let body = match && match[2];
  return subject && body ? { subject, body } : null;
}

async function renderTemplate(template, templateData, instance) {
  const nunjucksEnv = await nunjucksEnvReady;
  const subject = nunjucksEnv.renderString(template.subject, {
    ...templateData,
  });
  let body = nunjucksEnv.renderString(template.body, { ...templateData });

  if (instance.engine === 'email') {
    const result = await mjml2html(body);
    if (result.errors?.length) {
      console.error(
        `MJML validation errors in notification template "${instance.type}" for project ${instance.projectId}:`,
        result.errors
          .map((error) => error.formattedMessage || error.message)
          .join('; ')
      );
    }
    if (!result.html) {
      throw new Error(
        `MJML rendered an empty body for notification template "${instance.type}"`
      );
    }
    body = result.html;
  }

  return { subject, body };
}

module.exports = (db, sequelize, DataTypes) => {
  const NotificationMessage = sequelize.define(
    'notification_message',
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

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        defaultValue: 'new',
      },

      subject: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },

      from: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },

      to: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },

      body: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,
      },
    },
    {
      hooks: {
        beforeValidate: async function (instance, options) {
          if (options.data) {
            let template, templateData;
            let isCustomTemplate = false;
            try {
              template = await db.NotificationTemplate.findOne({
                where: {
                  projectId: instance.projectId,
                  type: instance.type,
                },
              });
              isCustomTemplate = !!template;
              if (!template) {
                template = await loadDefaultTemplate(instance.type);
              }
              if (!template)
                throw new Error(
                  `Notification template not found for type '${instance.type}' (default template could not be parsed)`
                );

              templateData = options.data;
              templateData.project = await db.Project.scope(
                'includeConfig',
                'includeEmailConfig'
              ).findByPk(instance.projectId);
              let keys = ['resource', 'user', 'comment', 'submission'];
              for (let key of keys) {
                let idkey = key + 'Id';
                let model = key.charAt(0).toUpperCase() + key.slice(1);

                if (options.data[idkey]) {
                  // Handle array of ids
                  if (
                    Array.isArray(options.data[idkey]) &&
                    options.data[idkey].length == 1
                  ) {
                    options.data[idkey] = options.data[idkey][0];
                  }

                  // If there are multiple IDs
                  if (Array.isArray(options.data[idkey])) {
                    templateData[`${key}s`] = await db[model].findAll({
                      where: { id: options.data[idkey] },
                    });
                  } else {
                    // Special handling for 'Resource'
                    if (model === 'Resource') {
                      templateData[key] = await db.Resource.findByPk(
                        options.data[idkey],
                        {
                          include: [
                            { model: db.Tag, attributes: ['name', 'type'] },
                          ],
                        }
                      );
                    } else {
                      // Default behavior for other models
                      templateData[key] = await db[model].findByPk(
                        options.data[idkey]
                      );
                    }
                  }
                }
              }
            } catch (err) {
              throw err;
            }

            let rendered;
            try {
              rendered = await renderTemplate(template, templateData, instance);
            } catch (err) {
              console.error(
                `Failed to render notification template "${instance.type}" for project ${instance.projectId}:`,
                err
              );
              if (!isCustomTemplate) throw err;

              const defaultTemplate = await loadDefaultTemplate(instance.type);
              if (!defaultTemplate) throw err;
              rendered = await renderTemplate(
                defaultTemplate,
                templateData,
                instance
              );
            }
            instance.subject = rendered.subject;
            instance.body = rendered.body;

            // Carry PDF attachment as non-persisted property for email sending
            if (options.data?.pdfAttachment) {
              instance._pdfAttachment = options.data.pdfAttachment;
            }
          }
        },
      },
    }
  );

  NotificationMessage.associate = function (models) {
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  };

  NotificationMessage.auth = NotificationMessage.prototype.auth = {
    listableBy: 'editor',
    viewableBy: 'editor',
    createableBy: 'editor',
    updateableBy: 'editor',
    deleteableBy: 'editor',
  };

  NotificationMessage.prototype.send = async function () {
    try {
      await sendMessage[this.engine]({ message: this });
      await this.update({ status: 'sent' });
    } catch (err) {
      console.error('Send failed:', err);
      throw err;
    }
  };

  return NotificationMessage;
};

module.exports.loadDefaultTemplate = loadDefaultTemplate;
module.exports.renderTemplate = renderTemplate;
