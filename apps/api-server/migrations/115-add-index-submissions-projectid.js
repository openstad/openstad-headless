module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addIndex('submissions', ['projectId', 'createdAt'], {
      name: 'submissions_projectId_createdAt',
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeIndex(
      'submissions',
      'submissions_projectId_createdAt'
    );
  },
};
