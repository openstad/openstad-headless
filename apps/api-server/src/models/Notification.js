const merge = require('merge');

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

            // send immediatly or wait for cron
            let immediateTypes = [
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

              let messageData = {
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
              let pdfAttachment = null;

              if (instance.data.resourceId) {
                const resource = await db.Resource.findByPk(
                  instance.data.resourceId,
                  {
                    include: [{ model: db.Tag, attributes: ['name', 'type'] }],
                  }
                );

                const widget = !!resource
                  ? await db.Widget.findByPk(resource.widgetId)
                  : instance.widgetId || null;

                if (
                  widget &&
                  widget.dataValues.config &&
                  widget.dataValues.config.items
                ) {
                  const widgetItems = widget.dataValues.config.items;

                  const questionsAndAnswers = widgetItems.map((item) => {
                    const question = item.title || item.fieldKey;
                    const fieldKey = item.fieldKey;
                    let answer =
                      resource[fieldKey] ||
                      resource.extraData?.[fieldKey] ||
                      '';

                    if (fieldKey.includes('[') && fieldKey.includes(']')) {
                      const [mainKey, subKey] = fieldKey
                        .split(/[\[\]]/)
                        .filter(Boolean);
                      if (mainKey === 'tags') {
                        const tags = resource.tags.filter(
                          (tag) => tag.type === subKey
                        );
                        answer = tags.map((tag) => tag.name).join(', ');
                      }
                    } else {
                      if (
                        typeof answer === 'string' &&
                        answer.startsWith('[') &&
                        answer.endsWith(']')
                      ) {
                        try {
                          const parsedAnswer = JSON.parse(answer);
                          if (Array.isArray(parsedAnswer)) {
                            answer = parsedAnswer.length
                              ? parsedAnswer.join(', ')
                              : '';
                          }
                        } catch (e) {
                          // If parsing fails, keep the original answer
                        }
                      } else if (Array.isArray(answer)) {
                        // Check if the elements are objects with a 'url' field
                        if (
                          answer.every(
                            (item) =>
                              typeof item === 'object' &&
                              item !== null &&
                              'url' in item
                          )
                        ) {
                          // Determine if the field is for images or documents based on the fieldKey
                          answer = answer
                            .map((item, index) => {
                              const name =
                                item.name ||
                                (fieldKey === 'images'
                                  ? `Afbeelding ${index + 1}`
                                  : `Document ${index + 1}`);
                              return `<a href="${item.url}" target="_blank">${name}</a>`;
                            })
                            .join(', ');
                        } else {
                          answer = answer.join(', ');
                        }
                      } else if (
                        typeof answer === 'object' &&
                        answer !== null
                      ) {
                        answer = Object.entries(answer)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ');
                      }
                    }

                    return { question, answer };
                  });

                  htmlContent = `
                  <mj-table cellpadding="5" border="1px solid black" width="100%">
                    <tbody>
                      ${questionsAndAnswers
                        .map(
                          (qa) => `
                        <tr style="background-color: #f0f0f0;">
                          <td style="padding: 10px; font-weight: bold; color: #000; font-size: 13px;font-family: Roboto;">${qa.question}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                          <td style="padding: 10px; color: #000; font-size: 13px;font-family: Roboto;">
                            ${qa.answer}
                            <br/>
                          </td>
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </mj-table>
                `;

                  // Generate PDF attachment for user notifications only
                  const userNotificationTypes = [
                    'new concept resource - user feedback',
                    'new published resource - user feedback',
                    'updated resource - user feedback',
                  ];

                  if (
                    process.env.PDF_API_ENDPOINT &&
                    process.env.PDF_API_KEY &&
                    questionsAndAnswers.length > 0 &&
                    userNotificationTypes.includes(instance.type)
                  ) {
                    try {
                      const {
                        buildPdfHtml,
                        generatePdf,
                      } = require('../services/pdf-service');

                      // Build user data section
                      const userDetails = [];
                      if (instance.data?.userId) {
                        const pdfUser = await db.User.findByPk(
                          instance.data.userId
                        );
                        if (pdfUser) {
                          const fullName =
                            [pdfUser.firstname, pdfUser.lastname]
                              .filter(Boolean)
                              .join(' ') || pdfUser.name;
                          if (fullName)
                            userDetails.push({
                              question: 'Voor- en achternaam',
                              answer: fullName,
                            });
                          if (pdfUser.phoneNumber)
                            userDetails.push({
                              question: 'Telefoonnummer',
                              answer: pdfUser.phoneNumber,
                            });
                          if (pdfUser.email)
                            userDetails.push({
                              question: 'Email',
                              answer: pdfUser.email,
                            });
                          const addressParts = [
                            pdfUser.address,
                            pdfUser.postcode,
                            pdfUser.city,
                          ]
                            .filter(Boolean)
                            .join(' ');
                          if (addressParts)
                            userDetails.push({
                              question: 'Adres',
                              answer: addressParts,
                            });
                        }
                      }

                      const pdfItems = [];

                      // Add user data section if available
                      if (userDetails.length > 0) {
                        pdfItems.push({ section: 'Je gegevens' });
                        pdfItems.push(...userDetails);
                      }

                      // Add form data with sections
                      widgetItems.forEach((item, index) => {
                        if (item.type === 'none') {
                          pdfItems.push({ section: item.title || '' });
                        } else {
                          pdfItems.push(
                            questionsAndAnswers[index] || {
                              question: item.title || item.fieldKey || '',
                              answer: '',
                            }
                          );
                        }
                      });

                      const pdfProject = await db.Project.scope(
                        'includeEmailConfig'
                      ).findByPk(instance.projectId);
                      // Try emailConfig logo first, then fetch from auth server
                      let rawLogoUrl =
                        pdfProject?.emailConfig?.styling?.logo || '';
                      if (!rawLogoUrl) {
                        try {
                          const authSettings = require('../util/auth-settings');
                          const providers = await authSettings.providers({
                            project: pdfProject,
                          });
                          for (const provider of providers) {
                            if (provider === 'default') continue;
                            const authConfig = await authSettings.config({
                              project: pdfProject,
                              useAuth: provider,
                            });
                            const adapter = await authSettings.adapter({
                              authConfig,
                            });
                            if (
                              adapter.service.fetchClient &&
                              authConfig.clientId
                            ) {
                              const client = await adapter.service.fetchClient({
                                authConfig,
                                project: pdfProject,
                              });
                              if (client?.config?.styling?.logo) {
                                rawLogoUrl = client.config.styling.logo;
                                break;
                              }
                            }
                          }
                        } catch (err) {
                          console.error(
                            'Failed to fetch auth logo:',
                            err.message
                          );
                        }
                      }
                      let logoUrl = rawLogoUrl;
                      if (rawLogoUrl) {
                        try {
                          const {
                            fetchImageAsDataUrl,
                          } = require('../services/pdf-service');
                          logoUrl = await fetchImageAsDataUrl(rawLogoUrl);
                        } catch (err) {
                          console.error(
                            'Failed to fetch logo for PDF:',
                            err.message
                          );
                        }
                      }
                      const pdfHtml = buildPdfHtml(pdfItems, {
                        title:
                          pdfProject?.emailConfig?.notifications?.pdfTitle ||
                          'Nieuwe inzending',
                        description:
                          pdfProject?.emailConfig?.notifications
                            ?.pdfDescription || '',
                        logoUrl,
                      });
                      const pdfBuffer = await generatePdf(pdfHtml);
                      pdfAttachment = {
                        filename: `inzending-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf',
                      };
                    } catch (err) {
                      console.error(
                        'PDF generation failed, sending email without attachment:',
                        err
                      );
                    }
                  }
                }
              }

              let htmlContentEnquete = '';

              if (instance.data.submissionId) {
                const submission = await db.Submission.findByPk(
                  instance.data.submissionId
                );

                const widget = !!instance.data.widgetId
                  ? await db.Widget.findByPk(instance.data.widgetId)
                  : null;

                if (
                  widget &&
                  widget.dataValues.config &&
                  widget.dataValues.config.items &&
                  submission &&
                  submission.dataValues &&
                  submission.dataValues.submittedData
                ) {
                  const widgetItems = widget.dataValues.config.items;
                  const submittedData = submission.dataValues.submittedData;

                  const questionsAndAnswers = widgetItems.map((item) => {
                    const question = item.title || item.fieldKey;
                    const fieldKey = item.fieldKey;
                    let answer = submittedData[fieldKey] || '';

                    if (
                      typeof answer === 'string' &&
                      answer.startsWith('[') &&
                      answer.endsWith(']')
                    ) {
                      try {
                        const parsedAnswer = JSON.parse(answer);
                        if (Array.isArray(parsedAnswer)) {
                          answer = parsedAnswer.length
                            ? parsedAnswer.join(', ')
                            : '';
                        }
                      } catch (e) {
                        // If parsing fails, keep the original answer
                      }
                    } else if (Array.isArray(answer)) {
                      // Check if the elements are objects with a 'url' field
                      if (
                        answer.every(
                          (item) =>
                            typeof item === 'object' &&
                            item !== null &&
                            'url' in item
                        )
                      ) {
                        // Determine if the field is for images or documents based on the fieldKey
                        answer = answer
                          .map((item, index) => {
                            const name =
                              item.name ||
                              (fieldKey === 'images'
                                ? `Afbeelding ${index + 1}`
                                : `Document ${index + 1}`);
                            return `<a href="${item.url}" target="_blank">${name}</a>`;
                          })
                          .join(', ');
                      } else {
                        answer = answer.join(', ');
                      }
                    } else if (typeof answer === 'object' && answer !== null) {
                      answer = Object.entries(answer)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    }

                    return { question, answer };
                  });

                  htmlContentEnquete = `
                  <mj-table cellpadding="5" border="1px solid black" width="100%">
                    <tbody>
                      ${questionsAndAnswers
                        .map(
                          (qa) => `
                        <tr style="background-color: #f0f0f0;">
                          <td style="padding: 10px; font-weight: bold; color: #000; font-size: 13px;font-family: Roboto;">${qa.question}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                          <td style="padding: 10px; color: #000; font-size: 13px;font-family: Roboto;">
                            ${qa.answer}
                            <br/>
                          </td>
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </mj-table>
                `;
                }
              }

              let recipients =
                instance.to &&
                instance.to.split(',').map((email) => email.trim());
              if (recipients && recipients.length) {
                await Promise.all(
                  recipients.map(async (recipient) => {
                    let message = await db.NotificationMessage.create(
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
