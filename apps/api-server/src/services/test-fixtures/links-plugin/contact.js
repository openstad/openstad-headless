module.exports.createHandler = function (ctx) {
  return {
    ctx,
    async handle() {
      return { handled: true };
    },
  };
};
