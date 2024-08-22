'use strict';

const {Sequelize} = require("sequelize");
module.exports = {
  async up ({ context: queryInterface }) {
    queryInterface.createTable('comment_tags', {
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      commentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    });
  },

  async down ({ context: queryInterface }) {
    await queryInterface.dropTable('comment_tags');
  }
};