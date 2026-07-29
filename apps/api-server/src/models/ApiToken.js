module.exports = function (db, sequelize, DataTypes) {
  var ApiToken = sequelize.define(
    'api_token',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      tokenPrefix: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      lastFour: {
        type: DataTypes.STRING(4),
        allowNull: false,
      },
      expiresAt: {
        // null = token never expires
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'api_tokens',
      timestamps: true,
      paranoid: true,
    }
  );

  ApiToken.auth = ApiToken.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'never',
    deleteableBy: 'admin',
  };

  ApiToken.scopes = function () {};

  ApiToken.associate = function (models) {
    ApiToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner',
    });
  };

  return ApiToken;
};
