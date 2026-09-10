module.exports = {
  fields: {
    add: {
      hideMenuLink: {
        type: 'boolean',
        label: 'Do not link this item in the main menu; only open the submenu',
        def: false,
        if: {
          'hasSubpages()': true,
        },
      },
    },
    group: {
      utility: {
        fields: ['hideMenuLink'],
      },
    },
  },
  methods(self) {
    return {
      async hasSubpages(req, { docId }) {
        if (!docId) {
          return false;
        }

        const doc = await self.apos.doc.db.findOne(
          { _id: docId },
          { projection: { path: 1, aposLocale: 1, level: 1 } }
        );
        if (!doc || !doc.path) {
          return false;
        }

        const childCount = await self.apos.doc.db.countDocuments({
          path: new RegExp('^' + self.apos.util.regExpQuote(doc.path + '/')),
          aposLocale: doc.aposLocale,
          level: doc.level + 1,
          archived: { $ne: true },
        });

        return childCount > 0;
      },
    };
  },
};
