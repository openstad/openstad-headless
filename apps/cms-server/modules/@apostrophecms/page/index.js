// This configures the @apostrophecms/pages module to add a "home" page type to the
// pages menu

module.exports = {
  options: {
    types: [
      {
        name: 'default-page',
        label: 'Standaard pagina',
      },
      {
        name: '@apostrophecms/home-page',
        label: 'Home pagina',
      },
      {
        name: '@apostrophecms/blog-page',
        label: 'Blog page',
      },
    ],
    builders: {
      children: true,
      ancestors: {
        children: {
          depth: 2,
          relationships: false,
        },
      },
    },
  },
  extendMethods(self) {
    return {
      async implementParkOne(_super, req, item) {
        try {
          return await _super(req, item);
        } catch (e) {
          console.error(
            `[park-slug-fix] Caught error in implementParkOne for "${item.parkedId}":`,
            JSON.stringify({
              code: e.code,
              keyPattern: e.keyPattern,
              keyValue: e.keyValue,
              isUniqueError:
                typeof self.apos.doc.isUniqueError === 'function'
                  ? self.apos.doc.isUniqueError(e)
                  : 'method missing',
            })
          );

          if (
            (typeof self.apos.doc.isUniqueError === 'function'
              ? !self.apos.doc.isUniqueError(e)
              : e.code !== 11000) ||
            !e.keyPattern?.slug ||
            !e.keyPattern?.aposLocale
          ) {
            throw e;
          }

          const conflictSlug = e.keyValue?.slug;
          const conflictLocale = e.keyValue?.aposLocale;

          const conflict = await self.apos.doc.db.findOne({
            slug: conflictSlug,
            aposLocale: conflictLocale,
          });

          console.error(
            `[park-slug-fix] Conflict lookup result:`,
            JSON.stringify({
              conflictSlug,
              conflictLocale,
              foundId: conflict?._id,
              foundSlug: conflict?.slug,
              foundParkedId: conflict?.parkedId,
            })
          );

          if (!conflict) {
            throw e;
          }

          const dedupeSlug = `${conflictSlug}-duplicate-${conflict.aposDocId}`;

          await self.apos.doc.db.updateOne(
            { _id: conflict._id },
            { $set: { slug: dedupeSlug } }
          );

          self.apos.util.warnDev(
            `Resolved duplicate slug "${conflictSlug}" (locale: ${conflictLocale}): ` +
              `renamed document ${conflict._id} to "${dedupeSlug}"`
          );

          try {
            return await _super(req, item);
          } catch (retryError) {
            retryError.message = `Failed to park "${item.parkedId}" after resolving slug conflict: ${retryError.message}`;
            throw retryError;
          }
        }
      },
    };
  },
};
