const { DataTypes } = require('sequelize');

module.exports = {

  async up ({ context: queryInterface }) {
    queryInterface.createTable('oidc_code_verifiers', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    verifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.dropTable('oidc_code_verifiers');
  }

};
