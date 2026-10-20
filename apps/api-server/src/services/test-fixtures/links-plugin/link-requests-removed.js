module.exports.createHandler = function () {
  const removed = [];
  return {
    removed,
    async submit() {
      return {};
    },
    async getPendingSelection() {
      return [];
    },
    async linkRemoved(args) {
      removed.push(args);
    },
  };
};
