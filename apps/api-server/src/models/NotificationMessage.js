const nunjucks = require('nunjucks');
const mjml2html = require('mjml');
const sendMessage = require('../notifications/send-engines');
const defaultTemplatesCatalog = require('../notifications/default-templates-catalog');
const authSettings = require('../util/auth-settings');

// Elke ontvanger van elke mail levert een eigen NotificationMessage op, en die
// vroeg tot nu toe per stuk de clientnaam op bij de auth-server. Bij een mail aan
// honderden mensen zijn dat honderden identieke rondjes. Deze cache maakt er één
// per project per vijf minuten van.
const CLIENT_NAME_TTL_MS = 5 * 60 * 1000;
const clientNameCache = new Map();

async function fetchClientName(project) {
  try {
    const providers = await authSettings.providers({ project });
    for (const provider of providers) {
      if (provider === 'default') continue;
      const authConfig = await authSettings.config({
        project,
        useAuth: provider,
      });
      if (!authConfig.clientId) continue;
      const adapter = await authSettings.adapter({ authConfig });
      if (!adapter || !adapter.service || !adapter.service.fetchClient)
        continue;
      const client = await adapter.service.fetchClient({ authConfig, project });
      if (client && client.name) return client.name;
    }
  } catch (err) {
    // best-effort only; auth server may be unreachable or unconfigured
  }
  return null;
}

async function resolveClientName(project, fallback) {
  if (!project || !project.id) return fallback;

  const cached = clientNameCache.get(project.id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.name || fallback;
  }

  const name = await fetchClientName(project);
  clientNameCache.set(project.id, {
    name,
    expiresAt: Date.now() + CLIENT_NAME_TTL_MS,
  });
  return name || fallback;
}

let nunjucksEnv;

(async () => {
  const { applyFilters } =
    await import('../../../../packages/raw-resource/includes/nunjucks-filters-js.cjs');

  nunjucksEnv = new nunjucks.Environment();
  applyFilters(nunjucksEnv);
})();

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
            try {
              template = await db.NotificationTemplate.findOne({
                where: {
                  projectId: instance.projectId,
                  type: instance.type,
                },
              });
              if (!template) {
                template = await defaultTemplatesCatalog.getDefaultTemplate(
                  instance.type
                );
              }
              if (!template) throw new Error('Notification template not found');

              // Zonder deze check rendert mjml2html een blanco body naar niets,
              // de lege catch hieronder slikte die fout voorheen stil in, en er
              // ging een lege mail de deur uit.
              if (!template.body || !String(template.body).trim()) {
                throw new Error(
                  `Notification template '${instance.type}' is empty for project ${instance.projectId}; not sending`
                );
              }

              templateData = options.data;
              templateData.project = await db.Project.scope(
                'includeConfig',
                'includeEmailConfig'
              ).findByPk(instance.projectId);

              templateData.imagePath = process.env.EMAIL_ASSETS_URL || '';
              templateData.logo =
                (templateData.project &&
                  templateData.project.emailConfig &&
                  templateData.project.emailConfig.styling &&
                  templateData.project.emailConfig.styling.logo) ||
                '';
              templateData.projectName =
                (templateData.project &&
                  (templateData.project.title || templateData.project.name)) ||
                '';
              templateData.clientName = await resolveClientName(
                templateData.project,
                templateData.projectName
              );

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

            try {
              instance.subject = nunjucksEnv.renderString(template.subject, {
                ...templateData,
              });
              let body = nunjucksEnv.renderString(template.body, {
                ...templateData,
              });
              // mjml2html is now async
              body = await mjml2html(body);
              instance.body = body.html;
            } catch (err) {
              // Zonder deze melding gaat een mail met een lege body de deur uit
              // en staat er niets in de logs; de fout blijft dan onzichtbaar.
              console.error(
                `Rendering notification template '${instance.type}' for project ${instance.projectId} failed:`,
                err
              );
              throw err;
            }

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
