module.exports = ( db, sequelize, DataTypes ) => {
  const Notification = sequelize.define('notification', {
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
      defaultValue: 'NEW',
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    body: {
      type: DataTypes.BLOB,
      allowNull: true,
      unique: false,
    }
  }, {});

  Notification.auth = Notification.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return Notification;
};
