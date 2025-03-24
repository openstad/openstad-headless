const { DataTypes } = require('sequelize');

module.exports = {
  async up({ context: queryInterface }) {
    queryInterface.createTable('auth_providers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('oidc', 'saml'),
        allowNull: false,
        defaultValue: 'oidc',
      },
      config: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
        default: null,
      },
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('auth_providers');
  },
};
