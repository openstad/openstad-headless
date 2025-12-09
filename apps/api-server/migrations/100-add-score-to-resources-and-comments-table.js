const { Sequelize } = require('sequelize');
const { Resource, Comment } = require('../src/db');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'resources', 'score', {
      type: Sequelize.DECIMAL(12,11),
      allowNull: false,
      default: 0,
      after: 'sort',
    });
    
    // Fetch all resources and calculate their scores based on existing votes
    const resources = await Resource.findAll();
    for (const resource of resources) {
      // Workaround for validation in Resource model
      resource.auth.user = {
        role: 'admin'
      }
      await resource.calculateAndSaveScore();
    }
    
    await queryInterface.addColumn( 'comments', 'score', {
      type: Sequelize.DECIMAL(12,11),
      allowNull: false,
      default: 0,
      after: 'sentiment',
    });
    
    // Fetch all comments and calculate their scores based on existing votes
    const comments = await Comment.findAll();
    for (const comment of comments) {
      // Workaround for validation in Comment model
      comment.auth.user = {
        role: 'admin'
      }
      await comment.calculateAndSaveScore();
    }
  },

  async down ({ context: queryInterface }) {
    await queryInterface.removeColumn('resources', 'score');
    await queryInterface.removeColumn('comments', 'score');
  }
};
