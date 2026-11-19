module.exports = function (db, sequelize, DataTypes) {
  let LoginRevocation = sequelize.define(
    'login_revocation',
    {
      provider: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      identifier: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      revokedAt: {
        type: DataTypes.DATE(3),
        allowNull: false,
      },
    },
    {
      tableName: 'login_revocations',
      paranoid: false,
      indexes: [
        {
          unique: true,
          fields: ['provider', 'identifier'],
          name: 'login_revocations_unique',
        },
      ],
    }
  );

  LoginRevocation.auth = LoginRevocation.prototype.auth = {
    listableBy: 'admin',
    viewableBy: 'admin',
    createableBy: 'admin',
    updateableBy: 'admin',
    deleteableBy: 'admin',
  };

  return LoginRevocation;
};
