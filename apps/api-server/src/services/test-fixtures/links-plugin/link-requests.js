module.exports.createHandler = function (ctx) {
  return {
    ctx,
    async submit({ selection, removed, mode }) {
      return { received: selection.length, removed: removed.length, mode };
    },
    async getPendingSelection() {
      return [{ source: 'openstad', id: '2', status: 'pending' }];
    },
  };
};
