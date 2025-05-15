const express = require('express');

let router = express.Router({ mergeParams: true });
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimiter = require("../../util/rateLimiter");

let imageAppUrl = process.env.IMAGE_APP_URL_INTERNAL || '';

if (!imageAppUrl.startsWith('http')) {
  imageAppUrl = (process.env.FORCE_HTTP ? 'http://' : 'https://') + imageAppUrl;
}

let proxySettings = {
  target: imageAppUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api/project/([0-9]+)/upload': '',
  },
  headers: {
    'image-token': process.env.IMAGE_VERIFICATION_TOKEN,
  },
}

router
    .route('/images|/image|/document|/documents')
    .post( rateLimiter({ limit: 100, windowMs: 60000 }), (req, res, next) => {
        if (req.user && req.user?.role) {
          proxySettings.headers["x-user-role"] = req.user.role;
        }
        next();
    })
    .post(createProxyMiddleware(proxySettings))

module.exports = router;
