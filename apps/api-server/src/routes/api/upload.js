const express = require('express');
const { Op } = require('sequelize');
const config = require('config');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimiter = require('@openstad-headless/lib/rateLimiter');
const db = require('../../db');
const {
  UPLOAD_WIDGET_TYPES,
  projectAllowsAnonymousUpload,
  userCanUploadToProject,
} = require('../../services/upload-access');

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

// Fixed quota for this route. Passing the options keeps it independent of the
// operator-wide RATE_LIMIT / RATE_WINDOW_MS values.
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;
const UPLOAD_MAX_PER_WINDOW = 20;
const uploadLimiter = rateLimiter({
  windowMs: UPLOAD_WINDOW_MS,
  max: UPLOAD_MAX_PER_WINDOW,
});

function projectIdFromRequest(req) {
  if (req.project && req.project.id != null) return req.project.id;
  const parsed = Number(req.params.projectId);
  return Number.isInteger(parsed) ? parsed : null;
}

async function authorizeUpload(req, res, next) {
  try {
    const projectId = projectIdFromRequest(req);

    if (req.user?.id) {
      const adminProjectId = config.admin && config.admin.projectId;
      if (!userCanUploadToProject(req.user, projectId, adminProjectId)) {
        return res.status(403).send('Forbidden');
      }
      return next();
    }

    const widgets = await db.Widget.findAll({
      where: {
        projectId,
        type: { [Op.in]: UPLOAD_WIDGET_TYPES },
      },
      attributes: ['id', 'config'],
    });

    if (!projectAllowsAnonymousUpload(widgets)) {
      return res.status(401).send('Unauthorized');
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

function createUploadRouter(proxy) {
  const uploadRouter = express.Router({ mergeParams: true });
  uploadRouter
    .route('/images|/image|/document|/documents')
    .post(uploadLimiter, authorizeUpload)
    .post(proxy);
  return uploadRouter;
}

const router = createUploadRouter(imageProxyMw);
router.createUploadRouter = createUploadRouter;

module.exports = router;
