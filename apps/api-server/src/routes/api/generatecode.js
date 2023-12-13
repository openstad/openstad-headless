const fetch = require('node-fetch');
const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const crypto = require('crypto')

const express = require('express');
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(function(req, res, next) {
    const secret = "7a3bde0d196d439926e515fc167ffb8a"
    const hash = crypto.createHmac("sha256", secret).digest("hex")
    const ttl = Date.now() + 60 * 1000;
    const url = `http://localhost:31450/image?exp_date=${ttl}&signature=${hash}`

    res.json(url)
  })

module.exports = router;
