const express = require('express');
const router = express.Router({ mergeParams: true });
const cors = require('cors');

router.use('/', cors(), require('./widget'));

module.exports = router;
