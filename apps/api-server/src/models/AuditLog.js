module.exports = function (db, sequelize, DataTypes) {
  var AuditLog = sequelize.define(
    'audit_log',
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      userRole: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      modelName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      modelId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      previousData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      newData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      hostname: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      routePath: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      referer: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      statusCode: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      source: {
        type: DataTypes.ENUM('api', 'auth'),
        allowNull: false,
        defaultValue: 'api',
      },
    },
    {
      tableName: 'audit_logs',
      timestamps: true,
      updatedAt: false,
      paranoid: false,
    }
  );

  AuditLog.auth = AuditLog.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'never',
    deleteableBy: 'never',
  };

  AuditLog.scopes = function () {};
  AuditLog.associate = function () {};

  return AuditLog;
};
