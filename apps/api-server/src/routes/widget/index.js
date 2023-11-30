const express = require('express');
const router = express.Router({ mergeParams: true });
const cors = require('cors');

// @todo: this is fine for testing purposes, but we should bring this in line with the `security-headers.js` middleware.
// That will require websites to be allowlisted in the API server, but that's a good thing.
router.use('/', cors(), require('./widget'));

module.exports = router;
