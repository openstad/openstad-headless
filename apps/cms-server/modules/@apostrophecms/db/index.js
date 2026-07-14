module.exports = {
  extendMethods(self) {
    return {
      // The project passes its MongoDB configuration as a top-level `mongo`
      // option to apostrophe() in app.js (see `project.mongo`), rather than as
      // options of this module. Apostrophe's native connectToDb reads the
      // connection settings from this module's own options, so bridge the
      // top-level `mongo` option onto self.options before delegating to the
      // built-in implementation. This replaces an older copy of Apostrophe's
      // internal connect routine that depended on apostrophe/lib/mongodb-connect,
      // which was removed in Apostrophe 4.31.
      async connectToDb(_super) {
        Object.assign(self.options, self.apos.options.mongo || {});
        return _super();
      },
    };
  },
};
