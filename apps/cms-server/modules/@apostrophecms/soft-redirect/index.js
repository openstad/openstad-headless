const parseurl = require('parseurl');

module.exports = {
  extendHandlers(self) {
    return {
      '@apostrophecms/page:notFound': {
        async notFoundRedirect(superMethod, req) {
          const before = req.redirect;
          await superMethod(req);
          if (!req.redirect || req.redirect === before) return;
          const search = parseurl.original(req).search;
          if (search && !req.redirect.includes('?')) {
            req.redirect = req.redirect + search;
          }
        },
      },
    };
  },
};
