module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addIndex('votes', ['resourceId', 'opinion'], {
      name: 'votes_resourceId_opinion',
    });

    await queryInterface.addIndex('comments', ['resourceId'], {
      name: 'comments_resourceId',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeIndex('votes', 'votes_resourceId_opinion');
    await queryInterface.removeIndex('comments', 'comments_resourceId');
  },
};
