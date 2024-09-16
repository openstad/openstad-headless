const merge = require('merge');

module.exports = ( db, sequelize, DataTypes ) => {
  const Notification = sequelize.define('notification', {

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

  }, {

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
          project = await db.Project.scope('includeEmailConfig').findByPk(instance.projectId);
          instance.from = project.emailConfig?.notifications?.fromAddress;
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
            'message by carrier pigeon'
          ];

          if (managerTypes.find(type => type == instance.type)) {
            let defaultRecipient = project.emailConfig?.notifications?.projectmanagerAddress;

            let overwriteEmail =  (
              instance.data.hasOwnProperty('emailReceivers')
              && Array.isArray(instance.data.emailReceivers)
              && instance.data.emailReceivers.length > 0
            ) ? instance.data.emailReceivers.join(',') : null;

            instance.to = overwriteEmail || defaultRecipient;
          }
          let adminTypes = ['system issues warning'];
          if (adminTypes.find(type => type == instance.type)) {
            instance.to = project.emailConfig?.notifications?.projectadminAddress;
          }
          if (!instance.to && instance.data?.userId){
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
            'login email', 'login sms',
            'user account about to expire',
            'project issues warning',
            'system issues warning',
            'action',
            'message by carrier pigeon'
          ];

          if (immediateTypes.find(type => type == instance.type)) {
            let messageData = {
              projectId: instance.projectId,
              engine: instance.engine,
              type: instance.type,
              from: instance.from,
              data: {
                ...instance.data
              }
            };


            let htmlContent = '';

            if ( instance.data.resourceId ) {
              const resource = await db.Resource.findByPk(instance.data.resourceId, {
                include: [{model: db.Tag, attributes: ['name', 'type']}]
              });

              const widget = !!resource ? await db.Widget.findByPk(resource.widgetId) : instance.widgetId || null;

              if (widget && widget.dataValues.config && widget.dataValues.config.items) {
                const widgetItems = widget.dataValues.config.items;

                const questionsAndAnswers = widgetItems.map(item => {
                  const question = item.title || item.fieldKey;
                  const fieldKey = item.fieldKey;
                  let answer = resource[fieldKey] || resource.extraData?.[fieldKey] || '';

                  if (fieldKey.includes('[') && fieldKey.includes(']')) {
                    const [mainKey, subKey] = fieldKey.split(/[\[\]]/).filter(Boolean);
                    if (mainKey === 'tags') {
                      const tags = resource.tags.filter(tag => tag.type === subKey);
                      answer = tags.map(tag => tag.name).join(', ');
                    }
                  } else {
                    if (typeof answer === 'string' && answer.startsWith('[') && answer.endsWith(']')) {
                      try {
                        const parsedAnswer = JSON.parse(answer);
                        if (Array.isArray(parsedAnswer)) {
                          answer = parsedAnswer.length ? parsedAnswer.join(', ') : '';
                        }
                      } catch (e) {
                        // If parsing fails, keep the original answer
                      }
                    } else if (Array.isArray(answer)) {
                      answer = answer.length ? answer.join(', ') : '';
                    } else if (typeof answer === 'object' && answer !== null) {
                      answer = Object.entries(answer).map(([key, value]) => `${key}: ${value}`).join(', ');
                    }
                  }

                  return {question, answer};
                });

                htmlContent = `
                  <mj-table cellpadding="5" border="1px solid black" width="100%">
                    <tbody>
                      ${questionsAndAnswers.map(qa => `
                        <tr style="background-color: #f0f0f0;">
                          <td style="padding: 10px; font-weight: bold;">${qa.question}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                          <td style="padding: 10px;">
                            ${qa.answer}
                            <br/>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </mj-table>
                `;
              }
            }


            let htmlContentEnquete = '';

            if ( instance.data.submissionId ) {
              const submission = await db.Submission.findByPk(instance.data.submissionId);

              const widget = !!instance.data.widgetId ? await db.Widget.findByPk(instance.data.widgetId) : null;

              if (widget && widget.dataValues.config && widget.dataValues.config.items && submission && submission.dataValues && submission.dataValues.submittedData) {
                const widgetItems = widget.dataValues.config.items;
                const submittedData = submission.dataValues.submittedData;

                const questionsAndAnswers = widgetItems.map(item => {
                  const question = item.title || item.fieldKey;
                  const fieldKey = item.fieldKey;
                  let answer = submittedData[fieldKey] || '';

                  if (typeof answer === 'string' && answer.startsWith('[') && answer.endsWith(']')) {
                    try {
                      const parsedAnswer = JSON.parse(answer);
                      if (Array.isArray(parsedAnswer)) {
                        answer = parsedAnswer.length ? parsedAnswer.join(', ') : '';
                      }
                    } catch (e) {
                      // If parsing fails, keep the original answer
                    }
                  } else if (Array.isArray(answer)) {
                    answer = answer.length ? answer.join(', ') : '';
                  } else if (typeof answer === 'object' && answer !== null) {
                    answer = Object.entries(answer).map(([key, value]) => `${key}: ${value}`).join(', ');
                  }


                  return {question, answer};
                });

                htmlContentEnquete = `
                  <mj-table cellpadding="5" border="1px solid black" width="100%">
                    <tbody>
                      ${questionsAndAnswers.map(qa => `
                        <tr style="background-color: #f0f0f0;">
                          <td style="padding: 10px; font-weight: bold;">${qa.question}</td>
                        </tr>
                        <tr style="background-color: #ffffff;">
                          <td style="padding: 10px;">
                            ${qa.answer}
                            <br/>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </mj-table>
                `;
              }
            }

            let recipients = instance.to && instance.to.split(',').map(email => email.trim());
            if ( recipients && recipients.length ) {
              await Promise.all(recipients.map(async (recipient) => {
                let message = await db.NotificationMessage.create(
                  {...messageData, to: recipient},
                  {data: {...messageData.data, submissionContent: htmlContent, enqueteContent: htmlContentEnquete}}
                );
                await message.send();
              }));
            }

            await instance.update({ status: 'sent' });
          } else {
            await instance.update({ status: 'queued' });
          }

        } catch(err) {
          console.error(err);
        }
      }
    },

  });

  Notification.associate = function (models) {
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  }

  Notification.auth = Notification.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return Notification;

};
