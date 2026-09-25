module.exports.createHandler = function (ctx) {
  return {
    ctx,
    async submit({ selection, mode }) {
      return { received: selection.length, mode };
    },
    async getPendingSelection() {
      return [{ source: 'openstad', id: '2', status: 'pending' }];
    },
  };
};
