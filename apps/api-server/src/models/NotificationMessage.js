const fs = require('fs').promises;
const nunjucks = require('nunjucks');
const mjml2html = require('mjml');
const sendMessage = require('../notifications/send-engines');

module.exports = ( db, sequelize, DataTypes ) => {
  const NotificationMessage = sequelize.define('notification_message', {

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

  }, {

    hooks: {
      beforeValidate: async function (instance, options) {
        console.log('beforeValidate hook called for NotificationMessage');
        if (options.data) {
          let template, templateData;
          try {
            console.log('Fetching template for projectId:', instance.projectId, 'and type:', instance.type);
            template = await db.NotificationTemplate.findOne({
              where: {
                projectId: instance.projectId,
                type: instance.type,
              }
            });
            if (!template) {
              console.log('Template not found in database, reading from file');
              let file = await fs.readFile(`src/notifications/default-templates/${instance.type}`);
              file = file.toString();
              let match = file.match(/<subject>((?:.|\r|\n)*)<\/subject>(?:.|\r|\n)*<body>((?:.|\r|\n)*)<\/body>/)
              let subject = match && match[1];
              let body = match && match[2];
              if (subject && body) template = { subject, body };
            }
            if (!template) throw new Error('Notification template not found');

            console.log('Template found:', template);

            templateData = options.data;
            templateData.project = await db.Project.scope('includeConfig', 'includeEmailConfig').findByPk(instance.projectId);
            let keys = ['resource', 'user', 'comment', 'submission'];
            for (let key of keys) {
              let idkey = key + 'Id';
              let model = key.charAt(0).toUpperCase() + key.slice(1);
              if (options.data[idkey]) {
                if (Array.isArray(options.data[idkey]) && options.data[idkey].length == 1) options.data[idkey] = options.data[idkey][0];
                if (Array.isArray(options.data[idkey])) {
                  templateData[`${key}s`] = await db[model].findAll({ where: { id: options.data[idkey] } });
                } else {
                  templateData[key] = await db[model].findByPk(options.data[idkey]);
                }
              }
            }

            console.log('Template data prepared:', templateData);

          } catch (err) {
            console.error('Error fetching template or data:', err);
            throw err;
          }

          try {
            instance.subject = nunjucks.renderString(template.subject, { ...templateData });
            let body = nunjucks.renderString(template.body, { ...templateData });
            body = mjml2html(body);
            instance.body = body.html;
            console.log('Template rendered successfully:', { subject: instance.subject, body: instance.body });
          } catch (err) {
            console.error('Error rendering template:', err);
          }
        }
      }
    }

  });

  NotificationMessage.associate = function (models) {
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
  }

  NotificationMessage.auth = NotificationMessage.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  NotificationMessage.prototype.send = async function () {
    try {
      console.log('Sending notification with engine:', this.engine);
      await sendMessage[this.engine]({ message: this });
      await this.update({ status: 'sent' });
      console.log('Notification sent successfully');
    } catch (err) {
      console.error('Send failed:', err);
      throw err;
    }
  }

  return NotificationMessage;

};
