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
    const ttl = Date.now() + 60 * 1000;
    if (!process.env.IMAGE_VERIFICATION_TOKEN) throw new Error('API config error: IMAGE_VERIFICATION_TOKEN is empty')
    const secret = process.env.IMAGE_VERIFICATION_TOKEN + ttl
    const hash = crypto.createHmac("sha256", secret).digest("hex")
    let url = `${process.env.IMAGE_APP_URL}/image?exp_date=${ttl}&signature=${hash}`;
    let protocol = '';

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        protocol = process.env.FORCE_HTTP ? 'http://' : 'https://';
    }

    url = protocol + url;

    res.json(url)
  })

module.exports = router;
