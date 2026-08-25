const { safeRelativeUrl } = require('./lib/safe-relative-url');

module.exports = {
  init(self) {
    self.apos.template.addFilter({ safeRelativeUrl });
  },
};
