module.exports = {
  improve: 'apostrophe-assets',
  middleware: function () {
    return {
      cacheVersionedFrontendAssets: function (req, res, next) {
        if (req.path && req.path.startsWith('/apos-frontend/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }

        return next();
      },
    };
  },
};
