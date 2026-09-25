module.exports.createHandler = function (ctx) {
  return {
    ctx,
    async submit() {
      return { requests: [] };
    },
    async getPendingSelection() {
      return [];
    },
  };
};
