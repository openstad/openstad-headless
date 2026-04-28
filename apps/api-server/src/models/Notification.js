const merge = require('merge');
const {
  processResourceQA,
  processSubmissionQA,
} = require('../services/qa-processor');
const {
  buildPdfAttachment,
  shouldGeneratePdf,
} = require('../services/pdf-attachment');

function deriveNotificationTemplateData(instance) {
  const normalizeBaseUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const adminBaseUrl = normalizeBaseUrl(
    process.env.ADMIN_URL || process.env.ADMIN_DOMAIN
  );
  const adminResourceUrl =
    adminBaseUrl && instance.projectId && instance.data?.resourceId
      ? `${adminBaseUrl.replace(/\/+$/, '')}/projects/${instance.projectId}/resources/${instance.data.resourceId}`
      : '';

  const isAdminResourceNotification = [
    'new published resource - admin update',
    'updated resource - admin update',
  ].includes(instance.type);

  const redirectUrl =
    instance.data?.redirectUrl ||
    (isAdminResourceNotification ? adminResourceUrl : '');

  return {
    redirectUrl,
    adminResourceUrl,
  };
}

module.exports = (db, sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'notification',
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
        defaultValue: 'new',
      },

      from: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      to: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeValidate: async function (instance, options) {
          // set defaults - todo: opschonen en netter uitschrijven, maar eerst eens kijken of dit voldoet
          let engine = instance.engine || 'email';
          if (instance.type == 'login sms') {
            engine = instance.engine || 'sms';
          }
          if (instance.type == 'message by carrier pigeon') {
            engine = instance.engine || 'carrier pigeon';
          }
          instance.engine = engine;

          // from
          let project;
          if (instance.projectId || !instance.from) {
            project = await db.Project.scope('includeEmailConfig').findByPk(
              instance.projectId
            );
            instance.from = project.emailConfig?.notifications?.fromAddress;
          }

          if (
            project.emailConfig?.notifications?.fromName &&
            !!project.emailConfig?.notifications?.fromName
          ) {
            instance.from = `"${project.emailConfig.notifications.fromName}" <${instance.from}>`;
          }

          // to
          let user;
          if (!instance.to) {
            let managerTypes = [
              'new published resource - admin update',
              'updated resource - admin update',
              'new enquete - admin',
              'project issues warning',
              'new or updated comment - admin update',
              'submission',
              'action',
              'message by carrier pigeon',
            ];

            if (managerTypes.find((type) => type == instance.type)) {
              let defaultRecipient =
                project.emailConfig?.notifications?.projectmanagerAddress;

              if (defaultRecipient === 'email@not.set') {
                defaultRecipient = '';
              }

              let overwriteEmail =
                instance.data.hasOwnProperty('emailReceivers') &&
                Array.isArray(instance.data.emailReceivers) &&
                instance.data.emailReceivers.length > 0
                  ? instance.data.emailReceivers.join(',')
                  : null;

              instance.to = overwriteEmail || defaultRecipient;
            }
            let adminTypes = ['system issues warning'];
            if (adminTypes.find((type) => type == instance.type)) {
              instance.to =
                project.emailConfig?.notifications?.projectadminAddress;
            }
            if (!instance.to && instance.data?.userId) {
              user = await db.User.findByPk(instance.data?.userId);
              instance.to = user?.email;
              if (instance.engine == 'sms') {
                instance.to = user?.phoneNumber;
              }
            }
          }
        },

        afterCreate: async function (instance, options) {
          try {
            await instance.update({ status: 'pending' });

            // send immediately or wait for cron
            const immediateTypes = [
              'new concept resource - user feedback',
              'new published resource - user feedback',
              'updated resource - user feedback',
              'new enquete - admin',
              'new enquete - user',
              'new published resource - admin update',
              'updated resource - admin update',
              'notification comment - user',
              'notification comment reply - user',
              'login email',
              'login sms',
              'user account about to expire',
              'project issues warning',
              'system issues warning',
              'action',
              'message by carrier pigeon',
            ];

            if (immediateTypes.find((type) => type == instance.type)) {
              const derivedTemplateData =
                deriveNotificationTemplateData(instance);

              const messageData = {
                projectId: instance.projectId,
                engine: instance.engine,
                type: instance.type,
                from: instance.from,
                data: {
                  ...instance.data,
                  ...derivedTemplateData,
                },
              };

              let htmlContent = '';
              // _pdfAttachment is a non-persisted in-memory property.
              // This works because immediateTypes are sent synchronously
              // after .create() — never re-fetched from DB. If the send
              // flow is ever refactored to re-fetch, this property will be lost.
              let pdfAttachment = null;
              let htmlContentEnquete = '';

              // Process resource Q&A
              if (instance.data.resourceId) {
                const resourceResult = await processResourceQA(instance, db);
                htmlContent = resourceResult.htmlContent;

                if (
                  resourceResult.questionsAndAnswers.length &&
                  shouldGeneratePdf(instance.type)
                ) {
                  const project = await db.Project.scope(
                    'includeEmailConfig'
                  ).findByPk(instance.projectId);
                  if (
                    project?.emailConfig?.notifications?.pdfAttachmentEnabled
                  ) {
                    pdfAttachment = await buildPdfAttachment(
                      instance,
                      resourceResult.questionsAndAnswers,
                      resourceResult.widgetItems,
                      db,
                      project
                    );
                  }
                }
              }

              // Process submission Q&A
              if (instance.data.submissionId) {
                const submissionResult = await processSubmissionQA(
                  instance,
                  db
                );
                htmlContentEnquete = submissionResult.htmlContent;
              }

              // Create and send messages to all recipients
              const recipients =
                instance.to &&
                instance.to.split(',').map((email) => email.trim());
              if (recipients && recipients.length) {
                await Promise.all(
                  recipients.map(async (recipient) => {
                    const message = await db.NotificationMessage.create(
                      { ...messageData, to: recipient },
                      {
                        data: {
                          ...messageData.data,
                          submissionContent: htmlContent,
                          enqueteContent: htmlContentEnquete,
                          pdfAttachment,
                        },
                      }
                    );
                    await message.send();
                  })
                );
              }

              // Allow GC to reclaim PDF buffer immediately
              if (pdfAttachment) {
                pdfAttachment.content = null;
                pdfAttachment = null;
              }

              await instance.update({ status: 'sent' });
            } else {
              await instance.update({ status: 'queued' });
            }
          } catch (err) {
            console.error(err);
          }
        },
      },
    }
  );

  Notification.associate = function (models) {
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  };

  Notification.auth = Notification.prototype.auth = {
    listableBy: 'editor',
    viewableBy: 'editor',
    createableBy: 'editor',
    updateableBy: 'editor',
    deleteableBy: 'editor',
  };

  return Notification;
};
