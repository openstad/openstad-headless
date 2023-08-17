module.exports = (db, sequelize, DataTypes) => {
  const NotificationRecipient = sequelize.define('notification_recipients', {
    notificationRulesetId: {
      type: DataTypes.INTEGER,
      auth:  {
        updateableBy: 'editor',
      },
      allowNull: false,
      defaultValue: 0,
    },
    emailType: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
  }, {});

  NotificationRecipient.associate = function(models) {
    NotificationRecipient.belongsTo(models.NotificationRuleSet, { onDelete: 'CASCADE' });
  };

  NotificationRecipient.auth = NotificationRecipient.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return NotificationRecipient;
};
