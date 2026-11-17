const express = require('express');
const router = express.Router({ mergeParams: true });
const cors = require('cors');

// @todo: this is fine for testing purposes, but we should bring this in line with the `security-headers.js` middleware.
// That will require websites to be allowlisted in the API server, but that's a good thing.
router.use('/', cors(), require('./widget'));

const path = require('path');
// Serve the namespaced React runtime bundle
const reactRuntimePath = path.resolve(
  __dirname,
  '../../../dist/openstad-react-runtime.js'
);
router.get('/react-runtime.js', (req, res) => {
  // Cache headers via sendFile options so they only apply to the success
  // path; a cached error response would break widgets for max-age long.
  res.sendFile(reactRuntimePath, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=86400',
    },
  });
});

module.exports = router;
