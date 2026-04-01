const express = require('express');
const router = express.Router({ mergeParams: true });
const cors = require('cors');

// @todo: this is fine for testing purposes, but we should bring this in line with the `security-headers.js` middleware.
// That will require websites to be allowlisted in the API server, but that's a good thing.
router.use('/', cors(), require('./widget'));

const path = require('path');
// Serve the namespaced React runtime bundle
router.use(
  '/react-runtime.js',
  express.static(
    path.resolve(__dirname, '../../../dist/openstad-react-runtime.js'),
    {
      maxAge: '1d',
      setHeaders: (res) => {
        res.setHeader('Content-Type', 'application/javascript');
      },
    }
  )
);

module.exports = router;
