function getDefaults(self, req) {
  const project =
    (req && req.project) ||
    (self.apos && self.apos.options && self.apos.options.project) ||
    {};
  const global = (req && req.data && req.data.global) || {};

  return {
    canonicalDefault: project.url || '',
    organizationDefault:
      project.title ||
      global.projectTitle ||
      (req &&
        req.data &&
        req.data.projectConfig &&
        req.data.projectConfig.organisationName) ||
      'OpenStad',
  };
}

function logSafeWarning(self, message, error) {
  const logger = self && self.apos && self.apos.util;
  const details = error && error.message ? error.message : error;
  if (logger && typeof logger.warn === 'function') {
    logger.warn(
      `[seo-fields-global] ${message}${details ? `: ${details}` : ''}`
    );
    return;
  }
  console.warn('[seo-fields-global]', message, details || '');
}

module.exports = {
  improve: '@apostrophecms/seo-fields-global',

  init: function (self) {
    const applySeoSchemaOverrides = () => {
      if (!Array.isArray(self.schema)) {
        return;
      }

      const defaults = getDefaults(self);
      const canonicalField = self.schema.find(
        (field) => field && field.name === 'seoSiteCanonicalUrl'
      );
      const organizationField = self.schema.find(
        (field) => field && field.name === 'seoJsonLdOrganization'
      );

      let organizationNameField = null;
      if (
        organizationField &&
        organizationField.fields &&
        organizationField.fields.add &&
        organizationField.fields.add.name
      ) {
        organizationNameField = organizationField.fields.add.name;
      } else if (organizationField && Array.isArray(organizationField.schema)) {
        organizationNameField = organizationField.schema.find(
          (field) => field && field.name === 'name'
        );
      }

      if (canonicalField && canonicalField.type === 'url') {
        canonicalField.required = false;
        if (!canonicalField.def && defaults.canonicalDefault) {
          canonicalField.def = defaults.canonicalDefault;
        }
      }

      if (organizationNameField) {
        organizationNameField.required = false;
        if (!organizationNameField.def) {
          organizationNameField.def = defaults.organizationDefault;
        }
      }
    };

    self.on(
      'apostrophe:modulesReady',
      'openstadPatchSeoFieldsGlobalSchema',
      applySeoSchemaOverrides
    );

    self.on(
      'apostrophe:modulesReady',
      'openstadBackfillSeoGlobalDefaultsInDb',
      async function () {
        try {
          if (
            !self.apos ||
            !self.apos.doc ||
            !self.apos.doc.db ||
            typeof self.apos.doc.db.updateMany !== 'function'
          ) {
            logSafeWarning(self, 'Skipping SEO backfill: doc db not available');
            return;
          }

          const defaults = getDefaults(self);
          const globalTypes = {
            $in: ['@apostrophecms/global', 'apostrophe-global'],
          };

          if (defaults.canonicalDefault) {
            try {
              await self.apos.doc.db.updateMany(
                {
                  type: globalTypes,
                  $or: [
                    { seoSiteCanonicalUrl: { $exists: false } },
                    { seoSiteCanonicalUrl: '' },
                    { seoSiteCanonicalUrl: null },
                  ],
                },
                { $set: { seoSiteCanonicalUrl: defaults.canonicalDefault } }
              );
            } catch (err) {
              logSafeWarning(self, 'Canonical URL backfill failed', err);
            }
          }

          if (defaults.organizationDefault) {
            try {
              await self.apos.doc.db.updateMany(
                {
                  type: globalTypes,
                  $or: [
                    { 'seoJsonLdOrganization.name': { $exists: false } },
                    { 'seoJsonLdOrganization.name': '' },
                    { 'seoJsonLdOrganization.name': null },
                  ],
                },
                {
                  $set: {
                    'seoJsonLdOrganization.name': defaults.organizationDefault,
                  },
                }
              );
            } catch (err) {
              logSafeWarning(self, 'Organization name backfill failed', err);
            }
          }
        } catch (err) {
          logSafeWarning(
            self,
            'Startup SEO backfill skipped due to unexpected error',
            err
          );
        }
      }
    );

    self.on(
      'apostrophe-docs:beforeSave',
      'openstadBackfillSeoGlobalDefaults',
      function (req, doc) {
        if (
          !doc ||
          (doc.type !== 'apostrophe-global' &&
            doc.type !== '@apostrophecms/global')
        ) {
          return;
        }

        const defaults = getDefaults(self, req);

        if (!doc.seoSiteCanonicalUrl && defaults.canonicalDefault) {
          doc.seoSiteCanonicalUrl = defaults.canonicalDefault;
        }

        if (
          !doc.seoJsonLdOrganization ||
          typeof doc.seoJsonLdOrganization !== 'object'
        ) {
          doc.seoJsonLdOrganization = {};
        }

        if (!doc.seoJsonLdOrganization.name && defaults.organizationDefault) {
          doc.seoJsonLdOrganization.name = defaults.organizationDefault;
        }
      }
    );
  },

  middleware: function (self) {
    return {
      openstadPrefillSeoFieldsGlobal: function (req, res, next) {
        const defaults = getDefaults(self, req);

        req.data.global = req.data.global || {};

        if (!req.data.global.seoSiteCanonicalUrl && defaults.canonicalDefault) {
          req.data.global.seoSiteCanonicalUrl = defaults.canonicalDefault;
        }

        if (
          !req.data.global.seoJsonLdOrganization ||
          typeof req.data.global.seoJsonLdOrganization !== 'object'
        ) {
          req.data.global.seoJsonLdOrganization = {};
        }

        if (
          !req.data.global.seoJsonLdOrganization.name &&
          defaults.organizationDefault
        ) {
          req.data.global.seoJsonLdOrganization.name =
            defaults.organizationDefault;
        }

        return next();
      },
    };
  },
};
