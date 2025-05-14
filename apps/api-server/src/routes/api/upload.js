const express = require('express');

let router = express.Router({ mergeParams: true });
const { createProxyMiddleware } = require('http-proxy-middleware');

let imageAppUrl = process.env.IMAGE_APP_URL_INTERNAL || '';

if (!imageAppUrl.startsWith('http')) {
  imageAppUrl = (process.env.FORCE_HTTP ? 'http://' : 'https://') + imageAppUrl;
}

const imageProxyMw = createProxyMiddleware({
  target: imageAppUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api/project/([0-9]+)/upload': '',
  },
  headers: {
    'image-token': process.env.IMAGE_VERIFICATION_TOKEN,
  },
});

router
    .route('/images|/image|/document|/documents')
    .post((req, res, next) => {
        // check if req.user is set
        // if (!req.user || !req.user?.id) {
        //   console.log ('upload path: no user found', req.user);
        //   return res.status(401).send('Unauthorized');
        // }
        next();
    })
    .post(imageProxyMw)

module.exports = router;
