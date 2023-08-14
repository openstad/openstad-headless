module.exports = (db, sequelize, DataTypes) => {
  const NotificationRuleSet = sequelize.define('notification_rulesets', {
    notificationTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    body: {
      type: DataTypes.JSON,
      allowNull: false,
      unique: false,
      defaultValue: '{}',
      get: function() {
        const value = this.getDataValue('body');
        try {
          if (typeof value === 'string') {
            return JSON.parse(value);
          }
        } catch (err) {
          console.error('Invalid JSON NotificationRuleSet.body')
          console.error(err)
        }
        return value;
      },
      set: function(value) {
        try {
          if (typeof value === 'string') {
            value = JSON.parse(value);
          }
        } catch (err) {
          console.error('Invalid JSON NotificationRuleSet.body')
          console.error(err)
        }
        this.setDataValue('body', JSON.stringify(value));
      }
    },
  }, {});

  NotificationRuleSet.associate = function(models) {
    NotificationRuleSet.belongsTo(models.NotificationTemplate, { onDelete: 'CASCADE' });
    NotificationRuleSet.hasMany(models.NotificationRecipient);
  };

  NotificationRuleSet.scopes = function scopes() {
    return {
      // defaults
      default: {
        include: [{
          model: db.Project,
        }]
      },
      includeProject: {
        include : [{
          model: db.Project,
        }]
      },
      includeTemplate: {
        include : [{
          model: db.NotificationTemplate,
        }]
      },
      includeRecipients: {
        include : [{
          model: db.NotificationRecipient,
        }]
      },
    }
  }

  NotificationRuleSet.auth = NotificationRuleSet.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return NotificationRuleSet;
};
